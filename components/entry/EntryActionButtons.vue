<template lang="pug">
  div
    span(v-if="can_edit")
      span(v-if="is_view_mode")
        v-btn(@click="back()") back
        v-btn(color="info" @click="to_proper_mode") {{proper_mode}}
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
      v-btn(v-if="can_download" @click="download") download
        v-icon.ml-2 mdi-download
    span(v-else)
      v-btn(@click="back()") back
    DecisionDialog(v-bind="dialog_data" :open.sync="dialog_visible" v-on:action="dialog_action($event)")
</template>

<script>

  import {mapGetters} from "vuex"

  import {DRAFT, EDIT, PUBLISHED, REQUIRES_REVIEW} from "~/lib/consts"
  import EntryMixin from "~/components/entry/EntryMixin"
  import {
    ENTRIES_DELETE_ENTRY,
    ENTRIES_GET_ENTRY,
    ENTRIES_RESET_EDIT,
    ENTRIES_SAVE_ENTRY,
    ENTRIES_UPDATE_ENTRY
  } from "~/store/entries"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import {SEARCH_DELETE_ENTRY} from "~/store/search"
  import EntryNavMixin from "~/components/EntryNavMixin"
  import {prepare_for_submission} from "~/lib/entry"
  import {FILES_GET_FILE, FILES_REMOVE_FILE} from "~/store/files"
  import {base64file_to_blob} from "~/lib/util"
  import {LAST_BASE_PAGE_PATH, POP_LAST_PAGE_PATH} from "~/store"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import {APP_CONNECTED} from "~/store/app"
  import {USER_LOGGED_IN} from "~/store/user"
  import DecisionDialog from "~/components/util/DecisionDialog"
  import EntryActionsMixin from "~/components/entry/EntryActionsMixin"

  export default {
    name: "EntryActionButtons",
    mixins: [EntryMixin, EntryActionsMixin, TriggerSnackbarMixin, EntryNavMixin, PersistentStorageMixin],
    components: {DecisionDialog},
    props: {
      additional_actions: {
        type: Object
      },
      in_entry: Boolean,
      entry_complete: Boolean,
      is_dirty: Boolean
    },
    data() {
      return {
        sending: false,
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
      }
    },
    computed: {
      ...mapGetters({connected: APP_CONNECTED, logged_in: USER_LOGGED_IN}),
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
        return this.template.rules.download
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
    },
    methods: {
      to_proper_mode() {
        this.$emit("mode", this.proper_mode)
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
      async submit() {
        this.sending = true
        // TODO not good. call update functions
        this.$store.commit(ENTRIES_SAVE_ENTRY, this.entry)
        this.$store.dispatch("entries/update_entry", this.uuid)
        // todo just this.entry ???
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
          const sending_entry = prepare_for_submission(this.entry)
          const res = await this.$api.patch_entry__$uuid_accept(sending_entry)
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
          const sending_entry = prepare_for_submission(this.entry)
          const res = await this.$api.patch_entry__$uuid_reject(sending_entry)
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
          this.home()
        }
      }
    }
  }
</script>

<style scoped>

</style>
