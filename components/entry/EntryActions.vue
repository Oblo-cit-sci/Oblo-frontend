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
    div
      v-alert(v-if="is_edit_mode && can_edit && !logged_in" color="orange" type="warning")
        b You are not logged in
        div
          span You can submit observations but they need to be reviewed before they get published. In addition to that their privacy is automatically set to public and their license is set to (CC0) - No Rights reserved/public domain.&nbsp;
          a(href="https://creativecommons.org/share-your-work/public-domain/cc0/" target="_blank" style="color:white") Read more about CC0.
    div
      span(v-if="can_edit")
        span(v-if="is_view_mode && can_edit")
          v-btn(@click="back()") back
          v-btn(color="info" @click="edit") edit
        span(v-else-if="can_edit")
          v-btn(v-if="!is_view_mode" @click="cancel") {{cancel_word}}
          v-btn(v-if="is_draft" color="success" @click="save") {{save_word}}
          v-btn(v-if="!is_draft" color="error" @click="show_delete") Delete
          v-btn(
            v-if="show_submit"
            color="success"
            @click="submit"
            :disabled="disable_submit"
            :loading="sending") {{submit_word}}
          v-btn(
            v-if="is_review_mode"
            color="success"
            @click="accept"
            :disabled="disable_submit"
            :loading="sending") accept
          v-btn(
            v-if="is_review_mode"
            color="warning"
            @click="reject"
            :disabled="disable_submit"
            :loading="sending") reject
        // v-if="private_local" todo for now, download for everyone
        v-btn(v-if="can_download" :disabled="disable_download"  @click="download") download
          v-icon.ml-2 mdi-download
      span(v-else)
        v-btn(@click="back()") back
    DecisionDialog(v-bind="dialog_data" :open.sync="dialog_visible" v-on:action="dialog_action($event)")
</template>

<script>
  import {DRAFT, EDIT, PRIVATE_LOCAL, PUBLIC, PUBLISHED, REQUIRES_REVIEW} from "~/lib/consts";
  import Paginate from "../global/Paginate";
  import {current_user_is_owner, prepare_for_submission} from "~/lib/entry";

  import DecisionDialog from "../util/DecisionDialog";
  import EntryNavMixin from "../EntryNavMixin";

  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import {base64file_to_blob} from "~/lib/util";
  import PersistentStorageMixin from "../util/PersistentStorageMixin";
  import {FILES_GET_FILE, FILES_REMOVE_FILE} from "~/store/files";
  import {
    ENTRIES_DELETE_ENTRY,
    ENTRIES_GET_ENTRY,
    ENTRIES_RESET_EDIT,
    ENTRIES_SAVE_ENTRY,
    ENTRIES_UPDATE_ENTRY
  } from "~/store/entries";
  import EntryMixin from "./EntryMixin";
  import {SEARCH_DELETE_ENTRY} from "~/store/search";
  import {LAST_BASE_PAGE_PATH, POP_LAST_PAGE_PATH} from "~/store";

  import {mapGetters} from "vuex"
  import {APP_CONNECTED} from "~/store/app"
  import {USER_LOGGED_IN} from "~/store/user"

  export default {
    name: "EntryActions",
    components: {DecisionDialog, Paginate},
    mixins: [EntryNavMixin, TriggerSnackbarMixin, PersistentStorageMixin, EntryMixin],
    props: {
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
      cancel() {
        if (this.is_draft) {
          this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
          this.ok_snackbar("Creation canceled")
          this.$emit("entryAction", "delete")
          this.back()
        } else {
          this.$store.commit(ENTRIES_RESET_EDIT)
          this.back()
        }
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
      delete_entry() {
        this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
        this.$store.commit(SEARCH_DELETE_ENTRY, this.uuid)
        this.ok_snackbar("Entry deleted")
        this.$emit("entryAction", "delete")
        this.back()
      },
      save() {
        // todo not if it is an aspect page
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
        const sending_entry = prepare_for_submission(this.$store.getters[ENTRIES_GET_ENTRY](this.uuid))

        // would be the same as checking is_published
        let method = null
        if (this.entry.status === DRAFT) {
          method = "post_entry__$uuid"
        } else if (this.entry.status === PUBLISHED) {
          method = "patch_entry__$uuid"
        }
        if (method) {
          try {
            const res = await this.$api[method](sending_entry)

            const attachments_data = this.get_attachments_to_post(sending_entry)
            // console.log(attachments_data)
            for (let attachment_data of attachments_data) {
              const file_uuid = attachment_data.file_uuid
              const stored_file = this.$store.getters[FILES_GET_FILE](file_uuid)
              if (stored_file) {
                const blob = base64file_to_blob(stored_file.meta.type, stored_file.data)
                const formData = new FormData()
                formData.append("file", blob, stored_file.meta.name)
                this.$api.post_entry__$uuid__attachment__$file_uuid(this.uuid, file_uuid, formData).then((res) => {
                  this.$store.commit(FILES_REMOVE_FILE, file_uuid)
                }).catch(err => {
                  this.error_snackbar("File could not be uploaded", stored_file.meta.name)
                })
              }
            }
            this.sending = false
            this.ok_snackbar("Entry submitted")
            this.$store.commit(ENTRIES_SAVE_ENTRY, res.data.data)
            this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
            this.$store.commit(ENTRIES_RESET_EDIT)
            this.back(["search"])
          } catch (e) {
            console.log(e)
            this.sending = false
            const message = this.$_.get(e, "response.data.error.msg", "Something went wrong")
            // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
            this.error_snackbar(message)
          }
        } else {
          this.error_snackbar("not yet implemented for this status:", this.entry.status)
          this.sending = false
        }
      },
      async accept() {
        this.sending = true
        try {
          const res = await this.$api.patch_entry__$uuid_accept(this.entry)
          this.sending = false
          this.ok_snackbar("Entry reviewed")
          this.$store.commit(ENTRIES_SAVE_ENTRY, res.data.data)
          this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
          this.$store.commit(ENTRIES_RESET_EDIT)
          this.back()
        } catch (e) {
          const message = this.$_.get(e, "response.data.error.msg", "Something went wrong")
          // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
          this.error_snackbar(message)
        }
      },
      async reject() {
        this.sending = true
        try {
          const res = await this.$api.patch_entry__$uuid_reject(this.entry)
          this.sending = false
          this.ok_snackbar("Entry reviewed")
          this.$store.commit(ENTRIES_DELETE_ENTRY, res.data.data.uuid)
          this.$store.commit(SEARCH_DELETE_ENTRY, res.data.data.uuid)
          this.$store.commit(ENTRIES_RESET_EDIT)
          this.back()
        } catch (e) {
          const message = this.$_.get(e, "response.data.error.msg", "Something went wrong")
          // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
          this.error_snackbar(message)
        }
      },
      lastpage_reached($event) {
        console.log("an action lastpage_reached", $event)
      },
      back(remove_params = []) {
        // todo maybe use util.route_change_query
        const last_path = Object.assign({}, this.$store.getters[LAST_BASE_PAGE_PATH])
        console.log(remove_params, "lp", last_path)
        this.$store.commit(POP_LAST_PAGE_PATH)
        if (!this.$_.isEmpty(last_path)) {
          for (let p of remove_params) {
            delete last_path.query[p]
          }
          this.$router.push(last_path)
        } else {
          this.$router.push("/")
        }
      }
    },
    computed: {
      ...mapGetters({connected: APP_CONNECTED, logged_in: USER_LOGGED_IN}),
      dirty() {
        return this.entry.local.dirty
      },
      private_local() {
        return (this.template.rules.privacy || PUBLIC) === PRIVATE_LOCAL
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
      submit_word() {
        if (this.is_published) {
          return 'update'
        } else if (this.is_draft) {
          return "submit"
        } else if (this.entry.status === REQUIRES_REVIEW) {
          return "accept"
        }
      },
      show_submit() {
        return !this.private_local && !this.is_view_mode && !this.is_review_mode && !this.in_context
      },
      disable_submit() {
        if (!this.connected || !this.entry_complete) {
          return true
        } else {
          if (this.entry.status === REQUIRES_REVIEW) {
            return false
          } else {
            return !this.is_dirty && !this.is_draft
          }
        }
      },
      can_download() {
        //console.log(this.template.rules.download)
        return this.template.rules.download
      }
    }
  }

</script>
