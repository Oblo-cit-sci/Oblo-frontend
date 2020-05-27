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
    EntryActionButtons(
      :entry="entry"
      in_entry
      :entry_complete="entry_complete"
      :is_dirty="is_dirty"
      @mode="$emit('mode', $event)")
</template>

<script>
  import {PRIVATE_LOCAL, PUBLIC} from "~/lib/consts";
  import Paginate from "../global/Paginate";
  import {current_user_is_owner} from "~/lib/entry";

  import DecisionDialog from "../util/DecisionDialog";
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
    components: {EntryActionButtons, DecisionDialog, Paginate},
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
      dirty() {
        return this.entry.local.dirty
      },
      private_local() {
        return (this.template.rules.privacy || PUBLIC) === PRIVATE_LOCAL
      },
      owner() {
        return current_user_is_owner(this.$store, this.entry)
      }
    }
  }

</script>
