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
        v-btn(color="secondary" @click="edit") edit
      span(v-else-if="can_edit")
        v-btn(color="warning" @click="show_delete") delete
        v-btn(color="success" @click="save") {{save_word}}
        v-btn(
          v-if="can_submit"
          color="success"
          @click="submit"
          :disabled="!connected"
          :loading="sending") {{published ? 'update' : 'submit'}}
        v-btn(v-if="upload_option" @click="upload_to_repo" :loading="upload_loading") Upload to the repo
          v-icon.ml-2 mdi-send-circle
      // v-if="private_local" todo for now, download for everyone
      v-btn(v-if="can_download" :disabled="disable_download"  @click="download") download
        v-icon.ml-2 mdi-download
    span(v-else)
      v-btn(@click="back") back
    DecisionDialog(v-bind="dialog_data" :open.sync="dialog_visible" v-on:action="dialog_action($event)")
</template>

<script>
  import {
    DRAFT, EDIT, LICCI_PARTNERS,
    PRIVATE_LOCAL,
    PUBLIC, PUBLISHED,
    VIEW
  } from "../lib/consts";
  import Paginate from "./Paginate";
  import {current_user_is_owner, has_pages} from "../lib/entry";

  import DecisionDialog from "./DecisionDialog";
  import EntryNavMixin from "./EntryNavMixin";

  import {
    ENTRIES_DELETE_ENTRY,
    ENTRIES_GET_RECURSIVE_ENTRIES, ENTRIES_SAVE_ENTRY,
    LAST_BASE_PAGE_PATH, POP_LAST_PAGE_PATH
  } from "../lib/store_consts";
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
  import {CREATOR, entry_actor_relation} from "../lib/actors";
  import {get_release_mode} from "../lib/util";
  import EntryMixin from "./EntryMixin";
  import PersistentStorageMixin from "./PersistentStorageMixin";
  import {upload_to_repo} from "../lib/import_export";

  export default {
    name: "EntryActions",
    components: {DecisionDialog, Paginate},
    mixins: [EntryNavMixin, TriggerSnackbarMixin, EntryMixin, PersistentStorageMixin],
    props: {
      mode: {
        type: String // view, create edit
      },
      show_back_button: {
        type: Boolean
      }
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
      // BUTTONS
      upload_to_repo() {
        this.upload_loading = true
        const url = this.rules.activities.upload.url
        const entries = this.$store.getters[ENTRIES_GET_RECURSIVE_ENTRIES](this.uuid)
        const upload_promise = upload_to_repo(this.$store, this.$axios, entries, url, true)
        upload_promise.then(res => {
          this.snackbar(res.data.status, res.data.msg)
          this.upload_loading = false
        }).catch(err => {
          console.log(err)
          this.upload_loading = false
          this.error_snackbar("Something went horribly wrong")
        })
      },
      show_cancel() {
        if (this.dirty) {
          this.show_dialog(this.cancel_dialog_data)
        } else {
          this.cancel_edit()
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
            this.$api.delete_entry__$uuid(this.uuid)
            this.delete_entry()
          }
        }
      },
      cancel_edit() {
        if (this.entry.version === 0) {
          this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
          this.ok_snackbar("Creation canceled")
          this.back()
        }
      },
      delete_entry() {
        this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
        this.ok_snackbar("Entry deleted")
        this.$emit("entryAction", "delete")
        this.back()
      },
      save() {
        // todo not if it is an aspect page
        //save_entry(this.$store, this.entry)
        this.$store.dispatch(ENTRIES_SAVE_ENTRY)
        this.persist_entries()
        this.ok_snackbar("Entry saved")
        this.back()
      },
      submit() {
        //console.log("entryAction submit")
        this.sending = true
        // would be the same as checking published
        if (this.entry.status === DRAFT) {
          // const all_entries = this.$_.concat([this.entry], this.$store.getters[ENTRIES_GET_CHILDREN](this.entry))
          // todo, make the BE  work with many entries
          this.$api.post_entry(this.entry).then((res) => {
            this.sending = false
            this.ok_snackbar(res.data.msg)
            // todo- probably redundant, since its coming back
            this.entry.status = PUBLISHED
            this.$store.dispatch(ENTRIES_SAVE_ENTRY)
            this.back()
          }).catch((err) => {
            console.log("error", err)
            this.sending = false
          })
        } else if (this.entry.status === PUBLISHED) {
          this.$api.post_entry__$uuid(this.uuid, this.entry).then((res) => {
            this.sending = false
            this.ok_snackbar(res.data.msg)
            // todo- probably redundant, since its coming back
            this.$store.dispatch(ENTRIES_SAVE_ENTRY)
            this.back()
          }).catch((err) => {
            this.sending = false
            console.log("error", err)
          })
        } else {
          this.error_snackbar("not yet implemented for this status")
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
        console.log(current_user_is_owner(this.$store, this.entry))
        return current_user_is_owner(this.$store, this.entry)
      },
      save_word() {
        if (this.in_context) {
          return "save and back"
        } else if (this.private_local) {
          return "save"
        } else {
          if(this.published) {
            return "save"
          } else {
            return "save draft"
          }
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
      upload_option() {
        return this.template.rules.hasOwnProperty("activities") &&
          this.template.rules.activities.hasOwnProperty("upload")
      },
      initial_version() {
        return this.entry.version === 0
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
