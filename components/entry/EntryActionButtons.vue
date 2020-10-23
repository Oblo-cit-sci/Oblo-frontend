<template lang="pug">
  div
    span
      span(v-if="is_view_mode")
        v-btn(v-if="!is_domain_page" @click="back()") {{$t("w.back")}}
        v-btn(v-if="can_edit" color="info" @click="to_proper_mode") {{proper_mode_text}}
      span
        v-btn(v-if="!is_view_mode" @click="cancel") {{$t("w.cancel")}}
        v-btn(v-if="is_edit_mode && is_draft" color="success" @click="save") {{save_text}}
        v-btn(v-if="is_edit_mode && !is_draft" color="error" @click="delete_entry") {{$t("w.delete")}}
        v-btn(
          v-if="show_submit"
          color="success"
          @click="submit"
          :disabled="disable_submit"
          :loading="sending") {{submit_text}}
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
          :disabled="disable_reject"
          :loading="sending") reject
      // v-if="private_local" todo for now, download for everyone
      v-btn(v-if="can_download" @click="download") download
        v-icon.ml-2 mdi-download
</template>

<script>

import {mapGetters} from "vuex"

import {DRAFT, EDIT, PUBLISHED, REQUIRES_REVIEW, REVIEW, VIEW} from "~/lib/consts"
import EntryMixin from "~/components/entry/EntryMixin"
import {
  ENTRIES_DELETE_ENTRY,
  ENTRIES_GET_ENTRY,
  ENTRIES_SAVE_ENTRY,
  ENTRIES_UPDATE_ENTRY
} from "~/store/entries"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import {SEARCH_DELETE_ENTRY} from "~/store/search"
import EntryNavMixin from "~/components/EntryNavMixin"
import {prepare_for_submission} from "~/lib/entry"
import {FILES_GET_FILE, FILES_REMOVE_FILE} from "~/store/files"
import {base64file_to_blob} from "~/lib/util"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import {APP_CONNECTED} from "~/store/app"
import {USER_LOGGED_IN} from "~/store/user"
import EntryActionsMixin from "~/components/entry/EntryActionsMixin"

export default {
  name: "EntryActionButtons",
  mixins: [EntryMixin, EntryActionsMixin, TriggerSnackbarMixin, EntryNavMixin, PersistentStorageMixin],
  props: {
    mode: {
      type: String,
      validation: (val) => {
        [VIEW, EDIT, REVIEW].includes(val)
      }
    },
    additional_actions: {
      type: Object
    },
    in_entry: Boolean,
    entry_complete: Boolean,
    is_dirty: Boolean,
    has_errors: Boolean
  },
  data() {
    return {
      sending: false,
    }
  },
  computed: {
    ...mapGetters({connected: APP_CONNECTED, logged_in: USER_LOGGED_IN}),
    show_submit() {
      return !this.private_local && !this.is_view_mode && !this.is_review_mode && !this.in_context
    },
    disable_submit() {
      if (!this.connected || !this.entry_complete || this.has_errors) {
        return true
      } else {
        return !this.is_dirty && !this.is_draft && this.has_errors
      }
    },
    disable_reject() {
      return !this.connected
    },
    can_download() {
      return true//this.template.rules.download
    },
    save_text() {
      if (this.in_context) {
        return this.$t("comp.entry_action_buttons.btn_save.save_n_back")
      } else if (this.private_local) {
        return this.$t("comp.entry_action_buttons.btn_save.save")
      } else if (this.is_draft) {
        return this.$t("comp.entry_action_buttons.btn_save.save_draft")
      } else {
        console.log("warning EntryAction.save_text should not be called")
        return this.$t("comp.entry_action_buttons.btn_save.save")
      }
    },
    submit_text() {
      if (this.is_published) {
        return this.$t("w.update")
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
        // this.$emit("entry-action", "cancel")
        // console.log("cancel draft")
        const base_t_cancel_loc = "comp.entry_actions.dialogs.cancel"
        this.$bus.$emit("dialog-open", {
          data: {
            title: this.$t(`${base_t_cancel_loc}.title`),
            text: this.$t(`${base_t_cancel_loc}.text`),
            cancel_color: "",
            confirm_color: "error",
            cancel_text: this.$t(`${base_t_cancel_loc}.cancel_text`),
            confirm_text: this.$t(`${base_t_cancel_loc}.confirm_text`)
          }, confirm_method: () => {
            this.$emit("entry-action", "delete")
            this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
            this.back()
            this.ok_snackbar(this.$t("comp.entry_actions.cancel_draft"))
          }
        })
      } else {
        this.back()
      }
    },
    delete_entry() {
      const base_t_delete_loc = "comp.entry_actions.dialogs.delete"
      this.$bus.$emit("dialog-open", {
        data: {
          title: this.$t(`${base_t_delete_loc}.title`),
          text: this.$t(`${base_t_delete_loc}.text`),
          cancel_color: "",
          confirm_color: "error",
          confirm_text: this.$t(`${base_t_delete_loc}.confirm_text`)
        }, confirm_method: () => {
          this.$api.delete_entry__$uuid(this.uuid).then(() => {
            this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.uuid)
            this.$store.commit(SEARCH_DELETE_ENTRY, this.uuid)
            this.ok_snackbar(this.$t("comp.entry_actions.delete_entry"))
            this.$emit("entry-action", "delete")
            this.back()
          }).catch(err => {
            this.err_error_snackbar(err)
          })
        }
      })
    },
    save() {
      // todo not if it is an aspect page
      // console.log(this.entry.local)
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
          this.back(["search"])
          // this.$store.commit(ENTRIES_RESET_EDIT)
        } catch (err) {
          console.log(err)
          this.sending = false
          // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
          this.err_error_snackbar(err)
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
        const entry = res.data.data
        // entry_location2geojson_arr(entry)
        this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
        await this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
        // new status doesnt really matter but it shouldnt be "required_review" anymore
        await this.$store.dispatch("map/set_entry_property", {uuid: entry.uuid, property_name: "status", value: "published"})
        this.back()
      } catch (err) {
        this.err_error_snackbar(err)
        // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
      }
    },
    async reject() {
      this.sending = true
      try {
        const sending_entry = prepare_for_submission(this.entry)
        const res = await this.$api.patch_entry__$uuid_reject(sending_entry)
        this.sending = false
        this.ok_snackbar("Entry reviewed")
        this.$store.commit(ENTRIES_DELETE_ENTRY, this.uuid)
        this.$store.commit(SEARCH_DELETE_ENTRY, this.uuid)
        this.$store.commit("map/delete_feature", {domain_name: this.entry.domain, uuid: this.uuid})
        this.back()
      } catch (err) {
        // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
        this.err_error_snackbar(err)
      }
    }
  }
}
</script>

<style scoped>

</style>
