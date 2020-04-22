<template lang="pug">
  v-container(justify-center align-center)
    v-row
      v-col(xs12 md12)
        Title_Description(
          :title="entry_title"
          header_type="h1"
          :description="template.description"
          mode="edit")
    v-row
      v-col(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
    v-row
      MetaChips(:meta_aspects="meta_aspects_privacy")
    v-row
      EntryActorList.mt-2(:actors="actors")
    v-row(justify="center" v-if="entry_image")
      v-col.col-md-10.col-sm-12(cols=12 alignSelf="center")
        v-img.float-md-right.float-sm-left.entry-display-size(
          contain
          :src="entry_image"
          max-height="500")
    v-row
      v-col(:cols="base_cols")
        v-divider.wide_divider(v-if="is_first_page")
    v-row
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h2"
          :description="page_info.description"
          mode="edit")
    br
    v-row(v-for="(aspect) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols")
        Aspect(
          :aspect="aspect"
          :aspect_loc="aspect_locs[aspect.name]"
          :extra="aspect_extras"
          :mode="mode")
    div(v-if="is_first_page")
      v-row
        v-col(:cols="base_cols")
          v-divider.wide_divider
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
  import EntryNavMixin from "../EntryNavMixin";
  import EntryMixin from "./EntryMixin";
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import PersistentStorageMixin from "../util/PersistentStorageMixin";
  import FullEntryMixin from "./FullEntryMixin";
  import DecisionDialog from "../util/DecisionDialog";
  import Aspect from "../Aspect";
  import EntryActions from "./EntryActions";
  import Title_Description from "../util/Title_Description";
  import MetaChips from "./MetaChips";
  import EntryActorList from "./EntryActorList";

  export default {
    name: "EntryView",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
      MetaChips,
      EntryActorList
    },
    props: {},
    data() {
      return {}
    },
    created() {

    },
    computed: {},
    methods: {},
    watch: {}
  }
</script>

<style scoped>

</style>
