<template lang="pug">
  div
    v-divider(class="wide_divider")
    Paginate(
      v-if="has_pages"
      :page="page"
      @update:page="update_page($event)"
      :total="template.rules.pages.length"
      :named_pages="named_pages"
      :entry="entry"
      :pages="template.rules.pages"
      @lastpage="more_follow_page = ($event)")
      // todo this can come back
    span(v-if="can_edit")
      span(v-if="view && can_edit")
        v-btn(@click="back") back
        v-btn(color="secondary" @click="edit") edit
      span(v-else-if="can_edit")
        v-btn(v-if="!view" color="warning" @click="show_cancel") {{cancel_word}}
        v-btn(v-if="is_draft" color="success" @click="save") {{save_word}}
        v-btn(v-if="!is_draft" color="error" @click="show_delete") Delete
        v-btn(
          v-if="can_submit"
          color="success"
          @click="submit"
          :disabled="!connected || !entry_complete || !is_dirty"
          :loading="sending") {{published ? 'update' : 'submit'}}
      // v-if="private_local" todo for now, download for everyone
      v-btn(v-if="can_download" :disabled="disable_download"  @click="download") download
        v-icon.ml-2 mdi-download
    span(v-else)
      v-btn(@click="back") back
    DecisionDialog(v-bind="dialog_data" :open.sync="dialog_visible" v-on:action="dialog_action($event)")
</template>

<script>
  import {DRAFT, EDIT, LICCI_PARTNERS, PRIVATE_LOCAL, PUBLIC, PUBLISHED, VIEW} from "../lib/consts";
  import Paginate from "./Paginate";
  import {current_user_is_owner, has_pages} from "../lib/entry";

  import DecisionDialog from "./DecisionDialog";
  import EntryNavMixin from "./EntryNavMixin";

  import {ENTRYTYPES_TYPE} from "../lib/store_consts";
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
  import {CREATOR, entry_actor_relation} from "../lib/actors";
  import {base64file_to_blob, get_release_mode} from "../lib/util";
  import PersistentStorageMixin from "./PersistentStorageMixin";
  import {FILES_GET_FILE, FILES_REMOVE_FILE} from "../store/files";
  import {
    ENTRIES_DELETE_ENTRY,
    ENTRIES_GET_ENTRY,
    ENTRIES_RESET_EDIT,
    ENTRIES_SAVE_ENTRY,
    ENTRIES_UPDATE_ENTRY
  } from "../store/entries";
  import EntryMixin2 from "./EntryMixin2";
  import {SEARCH_DELETE_ENTRY} from "../store/search";
  import {LAST_BASE_PAGE_PATH, POP_LAST_PAGE_PATH} from "../store";

  export default {
    name: "EntryActions",
    components: {DecisionDialog, Paginate},
    mixins: [EntryNavMixin, TriggerSnackbarMixin, PersistentStorageMixin, EntryMixin2],
    props: {
      entry: Object,
      template_slug: String,
      mode: {
        type: String // view, create edit
      },
      show_back_button: {
        type: Boolean
      },
      entry_complete: Boolean,
      is_dirty: Boolean
    },
    data() {
      return {
        dialog_visible: false,
        delete_dialog_data: {
          id: "delete",
          title: "Delete entry",
          text: "Are you sure you want to delete this entry?",
          cancel_color: "",
          confirm_color: "error",
          confirm_text: "delete"
        },
        cancel_dialog_data: {
          id: "cancel",
          title: "Dismiss changes",
          text: "Are you sure you want to dismiss your changes?",
          cancel_color: "",
          confirm_color: "error",
          cancel_text: "keep on editing",
          confirm_text: "dismiss"
        },
        dialog_data: {id: "none"},
        sending: false,
        upload_loading: false
      }
    },
    methods: {
      update_page(page) {
        this.page = page
        this.$emit('update:page', page)
      },
      edit() {
        this.$emit(EDIT)
      },
      show_cancel() {
        this.cancel_edit()
      },
      show_delete() {
        this.show_dialog(this.delete_dialog_data)
      },
      show_dialog(dialog_data) {
        this.dialog_data = dialog_data
        this.dialog_visible = true
      },
      dialog_action(event) {
        if (event.confirm) {
          if (event.id === this.cancel_dialog_data.id) {
            if (this.entry.version === 0) {
              this.delete_entry()
            }
            this.back()
          } else if (event.id === this.delete_dialog_data.id) {
            if (this.entry.status !== DRAFT)
              this.$api.delete_entry__$uuid(this.uuid)
            this.delete_entry()
          }
        }
      },
      cancel_edit() {
        if (this.is_draft) {
          this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
          this.ok_snackbar("Creation canceled")
          this.$emit("entryAction", "delete")
          this.back()
        } else {
          this.back()
        }
      },
      delete_entry() {
        this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
        this.$store.commit(SEARCH_DELETE_ENTRY, this.uuid)
        this.ok_snackbar("Entry deleted")
        this.$emit("entryAction", "delete")
        this.back()
      },
      save() {
        // todo not if it is an aspect page
        //save_entry(this.$store, this.entry)
        this.$store.commit(ENTRIES_SAVE_ENTRY, this.entry)
        this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
        this.persist_entries()
        this.ok_snackbar("Entry saved")
        this.back()
      },
      async submit() {
        this.sending = true

        // TODO not good. call update functions
        this.$store.commit(ENTRIES_SAVE_ENTRY, this.entry)
        this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
        const sending_entry = this.$store.getters[ENTRIES_GET_ENTRY](this.uuid)

        // would be the same as checking published
        let method = null
        if (this.entry.status === DRAFT) {
          method = "post_entry__$uuid"
        } else if (this.entry.status === PUBLISHED) {
          method = "patch_entry__$uuid"
        }
        if (method) {
          try {
            const res = await this.$api[method](this.entry.uuid, sending_entry)
            const attachments_data = this.get_attachments_to_post(sending_entry)
            console.log(attachments_data)
            for (let attachment_data of attachments_data) {
              const file_uuid = attachment_data.file_uuid
              const stored_file = this.$store.getters[FILES_GET_FILE](file_uuid)
              const blob = base64file_to_blob(stored_file.meta.type, stored_file.data)
              const formData = new FormData()
              formData.append("file", blob, stored_file.meta.name)
              this.$api.post_entry__$uuid__attachment__$file_uuid(this.uuid, file_uuid, formData).then((res) => {
                this.$store.commit(FILES_REMOVE_FILE, file_uuid)
              }).catch(err => {
                this.error_snackbar("File could not be uploaded", stored_file.meta.name)
              })
            }
            this.sending = false
            // this.entry.status = PUBLISHED
            this.ok_snackbar("Entry submitted")
            this.$store.commit(ENTRIES_SAVE_ENTRY, res.data.data)
            this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
            this.$store.commit(ENTRIES_RESET_EDIT)
            this.back()
          } catch (e) {
            console.log(e)
            this.sending = false
            this.error_snackbar("Something went wrong")
            // console.log(res)
          }

        } else {
          this.error_snackbar("not yet implemented for this status:", this.entry.status)
          this.sending = false
        }

      },
      lastpage_reached($event) {
        console.log("an action lastpage_reached", $event)
      },
      back() {
        const last_path = this.$store.getters[LAST_BASE_PAGE_PATH]
        this.$store.commit(POP_LAST_PAGE_PATH)
        if (last_path) {
          this.$router.push(last_path.fullPath)
        } else {
          this.$router.back()
        }
      }
    },
    computed: {
      uuid() {
        return this.entry.uuid
      },
      template() {
        return this.$store.getters[ENTRYTYPES_TYPE](this.template_slug)
      },
      view() {
        return this.mode === VIEW
      },
      dirty() {
        return this.entry.local.dirty
      },
      published() {
        return this.entry.status === PUBLISHED
      },
      private_local() {
        return (this.template.rules.privacy || PUBLIC) === PRIVATE_LOCAL
      },
      connected() {
        return this.$store.state.connected
      },
      has_pages() {
        return has_pages(this.template)
      },
      disable_download() {
        return false; // this.has_pages && !this.last_page
      },
      owner() {
        return current_user_is_owner(this.$store, this.entry)
      },
      cancel_word() {
        return "cancel"
      },
      save_word() {
        if (this.in_context) {
          return "save and back"
        } else if (this.private_local) {
          return "save"
        } else if (this.is_draft) {
          return "save draft"
        } else {
          console.log("wanring EntryAction.save_word should not be called")
          return "save"
        }
      },
      can_edit() {
        if (get_release_mode(this.$store) === LICCI_PARTNERS)
          return true
        let relation = entry_actor_relation(this.entry, this.$store.getters.user)
        return relation === CREATOR.actors_key
      },
      can_submit() {
        return !this.private_local && !this.view && !this.in_context && !this.partner_mode
      },
      is_draft() {
        return this.entry.status === DRAFT
      },
      can_download() {
        //console.log(this.template.rules.download)
        return this.partner_mode && this.template.rules.download
      },
      partner_mode() {
        return get_release_mode(this.$store) === LICCI_PARTNERS
      }
    }
  }

</script>
