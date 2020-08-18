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
    div
      v-alert(v-if="is_edit_mode && can_edit && !logged_in" color="orange" type="warning")
        b You are not logged in
        div
          span You can submit observations but they need to be reviewed before they get published. In addition to that their privacy is automatically set to public and their license is set to (CC0) - No Rights reserved/public domain.&nbsp;
          a(href="https://creativecommons.org/share-your-work/public-domain/cc0/" target="_blank" style="color:white") Read more about CC0.
    EntryActionButtons(
      v-bind="entry_action_buttons_props"
      @entry-action="$emit('entry-action', $event)"
      @mode="$emit('mode', $event)")
</template>

<script>
import {EDIT, REVIEW, VIEW} from "~/lib/consts";
import Paginate from "../global/Paginate";

import EntryNavMixin from "../EntryNavMixin";

import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import EntryMixin from "./EntryMixin";

import {mapGetters} from "vuex"
import {APP_CONNECTED} from "~/store/app"
import {USER_LOGGED_IN} from "~/store/user"
import EntryActionButtons from "~/components/entry/EntryActionButtons"

export default {
  name: "EntryActions",
  components: {EntryActionButtons, Paginate},
  mixins: [EntryNavMixin, TriggerSnackbarMixin, PersistentStorageMixin, EntryMixin],
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
    has_errors: Boolean
  },
  data() {
    return {
      upload_loading: false
    }
  },
  methods: {
    update_page(page) {
      this.page = page
      this.$emit('update:page', page)
    },
    lastpage_reached($event) {
      console.log("an action lastpage_reached", $event)
    }
  },
  computed: {
    ...mapGetters({connected: APP_CONNECTED, logged_in: USER_LOGGED_IN}),
    entry_action_buttons_props() {
      return {
        entry: this.entry,
        in_entry: this.in_entry,
        mode: this.mode,
        entry_complete: this.entry_complete,
        is_dirty: this.is_dirty,
        has_errors: this.has_errors
      }
    }
  }
}

</script>
