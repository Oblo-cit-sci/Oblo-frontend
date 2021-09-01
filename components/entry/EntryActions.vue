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
    EntryActionButtons(
      v-bind="entry_action_buttons_props"
      @entry-action="entryAction($event)"
      @mode="$emit('mode', $event)")
</template>

<script>
import {EDIT, QP_ENTRY_ACCESS_KEY, QP_ENTRY_MODE, QP_UUID, REVIEW, VIEW} from "~/lib/consts";
import Paginate from "../global/Paginate";

import EntryNavMixin from "../EntryNavMixin";

import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import EntryMixin from "./EntryMixin";

import {mapGetters} from "vuex"
import EntryActionButtons from "~/components/entry/EntryActionButtons"
import {prepare_for_submission} from "~/lib/entry"
import AttachedFilesMixin from "~/components/aspect_utils/AttachedFilesMixin";
import {BUS_DIALOG_OPEN} from "~/plugins/bus";

export default {
  name: "EntryActions",
  components: {EntryActionButtons, Paginate},
  mixins: [EntryNavMixin, TriggerSnackbarMixin, PersistentStorageMixin, EntryMixin, AttachedFilesMixin],
  props: {
    mode: {
      type: String,
      validation: (val) => {
        [VIEW, EDIT, REVIEW].includes(val)
      }
    },
    show_back_button: {
      type: Boolean
    },
    entry_complete: Boolean,
    is_dirty: Boolean,
    has_errors: Boolean,
    allow_download: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sending: false
    }
  },
  methods: {
    entryAction(action) {
      switch (action) {
        case "cancel_draft":
          this.cancel_draft()
          break
        case "save":
          this.save()
          break
        case "submit":
          this.submit()
          break
        case "accept":
          this.review(true)
          break
        case "reject":
          this.review(false)
          break
        case "delete":
          this.delete()
          break
      }
      this.$emit('entry-action', action)
    },
    cancel_draft() {
      if (this.is_draft) {
        const base_t_cancel_loc = "comp.entry_actions.dialogs.cancel"
        this.$bus.$emit(BUS_DIALOG_OPEN, {
          data: {
            title: this.$t(`${base_t_cancel_loc}.title`),
            text: this.$t(`${base_t_cancel_loc}.text`),
            cancel_color: "",
            confirm_color: "error",
            cancel_text: this.$t(`${base_t_cancel_loc}.cancel_text`),
            confirm_text: this.$t(`${base_t_cancel_loc}.confirm_text`)
          }, confirm_method: async () => {
            await this.$store.dispatch("entries/delete_entry", this.uuid)
            this.back([QP_UUID, QP_ENTRY_ACCESS_KEY, QP_ENTRY_MODE])
            this.ok_snackbar(this.$t("comp.entry_actions.cancel_draft"))
            await this.persist_entries()
          }
        })
      } else {
        this.back()
      }
    },
    save() {
      // todo not if it is an aspect page
      this.$store.dispatch("entries/save_entry", {entry: this.entry, template: this.template})
      this.persist_entries()
      this.$bus.$emit(BUS_DIALOG_OPEN, {
        data: {
          title: this.$t('comp.entry_actions.saved'),
          text: this.$t('comp.entry_actions.saved_text'),
          show_cancel: false
        }
      })
      this.back()
    },
    async submit() {
      await this.$store.dispatch("entries/save_entry", {entry: this.entry, template: this.template})
      const sending_entry = prepare_for_submission(this.$store.getters["entries/get_entry"](this.uuid))

      // would be the same as checking is_published
      let method = null
      if (this.is_draft) {
        method = "post"
        const {data} = await this.$api.entry.exists(this.uuid)
        if (data.data) {
          method = "patch"
        }
      } else if (this.is_published) {
        method = "patch"
      }
      if (method) {
        try {
          const {data: resp} = await this.$api.entry[method](sending_entry)
          this.sending = false

          const attachments_data = this.get_attachments_to_post(sending_entry)
          this.send_attachments(attachments_data, this.entry.uuid)
          this.ok_snackbar(resp.msg)
          this.$store.commit("entries/save_entry", resp.data.entry)
          this.$store.commit("entries/set_edit", resp.data.entry)

          await this.$store.dispatch("map/update_entry_features", {
            domain: this.entry.domain,
            entry_features: resp.data.map_features
          })
          this.back(["search"])
          this.persist_entries()
        } catch (err) {
          console.log(err)
          this.sending = false
          // todo for entry exists already, there could be a change in the button label, but maybe the data of that entry should be fetched
          this.err_error_snackbar(err)
        }
      }
    },
    async review(accept) {
      this.sending = true
      const method = accept ? "patch_accept" : "patch_reject"
      await this.$store.dispatch("entries/save_entry", {entry: this.entry, template: this.template})
      const sending_entry = prepare_for_submission(this.$store.getters["entries/get_entry"](this.uuid))
      try {
        const {data} = await this.$api.entry[method](sending_entry)
        this.sending = false
        this.ok_snackbar(data.msg)
        if (accept) {
          this.$store.commit("entries/save_entry", data.data.entry)
          // console.log(this.entry.status, sending_entry.status, data.data.entry.status)
          await this.$store.dispatch("map/update_entry_features", {
            domain: this.entry.domain,
            entry_features: data.data.map_features
          })
          // we need this, otherwise when coming back to the same entry right away, it will not change edit, and the status will be wrong
          this.$store.commit("entries/set_edit", data.data.entry)
        } else {
          this.$store.commit("entries/delete_entry", this.uuid)
          this.$store.commit("search/delete_entry", this.uuid)
          this.$store.commit("map/delete_feature", {domain_name: this.entry.domain, uuid: this.uuid})
        }
        let remove_params = ["search"]
        if (!accept) {
          remove_params = remove_params.concat(["uuid", "entry_mode"])
        }
        this.back(remove_params)
      } catch (err) {
        console.log(err)
        this.err_error_snackbar(err)
        this.sending = false
      }
    },
    update_page(page) {
      this.page = page
      this.$emit('update:page', page)
    },
    async delete() {
      const base_t_delete_loc = "comp.entry_actions.dialogs.delete"
      this.$bus.$emit(BUS_DIALOG_OPEN, {
        data: {
          title: this.$t(`${base_t_delete_loc}.title`),
          text: this.$t(`${base_t_delete_loc}.text`),
          cancel_color: "",
          confirm_color: "error",
          confirm_text: this.$t(`${base_t_delete_loc}.confirm_text`)
        }, confirm_method: () => {
          this.$api.entry.delete(this.uuid).then((resp) => {
            this.$store.dispatch("entries/delete_entry", this.uuid)
            this.$store.commit("search/delete_entry", this.uuid)
            this.$store.commit("map/delete_feature", {domain_name: this.entry.domain, uuid: this.uuid})
            this.ok_snackbar(resp.data.msg)
            this.$emit("entry-action", "delete")
            this.back([QP_UUID, QP_ENTRY_ACCESS_KEY, QP_ENTRY_MODE])
          }).catch(err => {
            this.err_error_snackbar(err)
          })
        }
      })
    },
    lastpage_reached($event) {
      console.log("an action lastpage_reached", $event)
    }
  },
  computed: {
    ...mapGetters({connected: "app/connected"}),
    entry_action_buttons_props() {
      return {
        entry: this.entry,
        sending: this.sending,
        in_entry: this.in_entry,
        mode: this.mode,
        entry_complete: this.entry_complete,
        is_dirty: this.is_dirty,
        has_errors: this.has_errors,
        allow_download: this.allow_download
      }
    }
  }
}

</script>
