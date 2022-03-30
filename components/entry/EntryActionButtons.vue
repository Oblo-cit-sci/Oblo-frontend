<template lang="pug">
  div
    span
      span(v-if="is_view_mode")
        v-btn(v-if="!is_domain_page" @click="back()") {{$t("w.back")}}
        v-btn(v-if="can_edit" color="info" @click="to_proper_mode") {{proper_mode_text}}
      span
        // cancel
        v-btn(v-if="is_draft && is_editable_mode" @click="cancel") {{$t("w.cancel")}}
        // save draft
        v-btn(v-if="is_edit_mode && is_draft" color="success" @click="save") {{save_text}}
        // delete
        v-btn(v-if="is_edit_mode && !is_draft" color="error" @click="delete_entry") {{$t("w.delete")}}
        // submit
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
          :loading="sending") {{$t('comp.entry_actions.review.accept')}}
        v-btn(v-if="show_share" @click="share") {{$t('comp.entry_actions.sharing.share')}}
          v-icon.ml-2 mdi-share-variant
        v-btn(v-if="show_revoke_share" @click="revoke_share") {{$t('comp.entry_actions.sharing.revoke_share')}}
        v-btn(
          v-if="is_review_mode"
          color="warning"
          @click="reject"
          :disabled="disable_reject"
          :loading="sending") {{$t('comp.entry_actions.review.reject')}}
      // v-if="private_local" todo for now, download for everyone
      v-btn(v-if="can_download" @click="download") {{$t('comp.entry_actions.download')}}
        v-icon.ml-2 mdi-download
</template>

<script>

import {mapGetters} from "vuex"

import {EDIT, PUBLISHED, REJECTED, REQUIRES_REVIEW, REVIEW, VIEW} from "~/lib/consts"
import EntryMixin from "~/components/entry/EntryMixin"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import EntryNavMixin from "~/components/EntryNavMixin"
import {prepare_for_submission} from "~/lib/entry"

import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
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
    sending: Boolean,
    is_dirty: Boolean,
    has_errors: Boolean,
    allow_download: Boolean
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters({connected: "app/connected", logged_in: "user/logged_in"}),
    show_submit() {
      return this.is_edit_mode && this.entry.status !== REJECTED
    },
    show_share() {
      return this.entry.status === PUBLISHED && this.is_view_mode && this.connected && this.can_edit
    },
    show_revoke_share() {
      return this.entry.rules?.has_entry_access_hash || false
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
      return this.logged_in && this.allow_download //this.template.rules.download
    },
    save_text() {
      if (this.private_local) {
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
        return this.$t("comp.entry_actions.submit")
      } else if (this.entry.status === REQUIRES_REVIEW) {
        return this.$t("comp.entry_actions.review.accept")
      }
    },
  },
  methods: {
    to_proper_mode() {
      this.$emit("entry-action", "edit_entry")
    },
    cancel() {
      this.$emit("entry-action","cancel_draft")
    },
    delete_entry() {
      this.$emit("entry-action","delete")
    },
    save() {
      this.$emit("entry-action", "save")
    },
    async submit() {
      this.$emit("entry-action", "submit")
    },
    async accept() {
      this.$emit("entry-action", "accept")
    },
    async reject() {
      this.$emit("entry-action", "reject")
    },
    async share() {
      this.$emit("entry-action", "share")
    },
    async revoke_share() {
      this.$emit("entry-action", "revoke_share")
    }
  }
}
</script>

<style scoped>

</style>
