<template lang="pug">
  v-container(justify-center align-center  v-if="!delete_entry && this.mode==='edit'")
    v-row
      v-col(xs12 md12)
        Title_Description(
          :title="page_title"
          header_type="h1"
          :description="template.description"
          mode="edit")
    v-row
      v-col(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
    v-row(justify="center" v-if="entry_image")
      v-col.col-md-10.col-sm-12(cols=12 alignSelf="center")
        v-img.float-md-right.float-sm-left.entry-display-size(
          contain
          :src="entry_image"
          max-height="500")
    v-row
      v-col(cols=8)
        v-divider(v-if="is_first_page" class="wide_divider")
    v-row
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h2"
          :description="page_info.description"
          mode="edit")
    br
    v-row(v-for="(aspect) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" cols=8)
        Aspect(
          :aspect="aspect"
          :aspect_loc="aspect_locs[aspect.name]"
          :extra="aspect_extras"
          :mode="mode")
    div(v-if="is_first_page")
      v-row
        v-col(cols=8)
          v-divider.wide_divider
      v-row
        v-col(alignSelf="stretch" cols=8 lg=4)
          Aspect(:aspect="license_aspect" :aspect_loc="license_aspect.aspect_loc" :extra="aspect_extras" :mode="mode")
        v-col(alignSelf="stretch" cols=8 lg=4)
          Aspect(:aspect="privacy_aspect" :aspect_loc="privacy_aspect.aspect_loc" :mode="mode")
      v-row
        v-col(alignSelf="stretch" cols=8)
          Aspect(:aspect="entry_roles_aspect" :aspect_loc="entry_roles_aspect.aspect_loc" :extra="{entry_is_private: entry.privacy==='private'}")
    v-row
      v-col(cols=8)
        v-divider(v-if="is_first_page" class="wide_divider")
    v-row(v-if="last_page")
      MissingAspectsNotice(:entry="this.entry" v-model="entry_complete")
    v-row
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        v-on:entryAction="entryAction($event)"
        v-on:edit="mode='edit'")
    v-row
      DecisionDialog(
        :open.sync="openSaveDialog"
        @action="edit_or_save_dialog($event)"
        v-bind="unsaved_changes_dialog")
</template>

<script>
  import DecisionDialog from "./DecisionDialog";
  import Aspect from "./Aspect";
  import EntryActions from "./EntryActions";
  import Title_Description from "./Title_Description";
  import MetaChips from "./MetaChips";
  import EntryNavMixin from "./EntryNavMixin";
  import EntryMixin from "./EntryMixin";
  import FullEntryMixin from "./FullEntryMixin";
  import EntryActorList from "./entry/EntryActorList";
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
  import PersistentStorageMixin from "./PersistentStorageMixin";
  import MissingAspectsNotice from "./entry/MissingAspectsNotice";

  export default {
    name: "EntryView",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      MissingAspectsNotice,
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
      MetaChips,
      EntryActorList
    },
    methods: {
      entryAction(action) {
        if (action === "delete") {
          this.delete_entry = true
        }
      }
    }
  }
</script>

<style scoped>

</style>
