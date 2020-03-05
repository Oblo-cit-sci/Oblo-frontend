<template lang="pug">
  v-row(justify-center align-center)
    v-col(cols=12)
      Title_Description(
        :title="page_title"
        header_type="h1"
        :description="entry_type.description")
      div(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
      div
        MetaChips(:meta_aspects="meta_aspects_privacy")
        EntryActorList.mt-2(:actors="actors")
      v-divider(class="wide_divider")
    v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-9' : 'col-md-12']")
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h2"
          :description="page_info.description")
      br
      div(v-for="(aspect) in shown_aspects" :key="aspect.name")
        Aspect(
          :aspect="aspect"
          :aspect_loc="aspect_locs[aspect.name]"
          v-on:entryAction="entryAction($event)"
          :mode="mode")
    v-col(v-if="show_image" cols=12 class="col-md-3 col-sm-12 entry-image")
      v-img(:src="entry_image()" aspect-ratio=1)
    v-col(class="entry-meta" cols=12)
          EntryActions(
            v-bind="entry_actions_props"
            :page.sync="page"
            v-on:entryAction="entryAction($event)"
            :v-bind="entry_navigation_props"
            v-on:edit="mode='edit'")
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
  import Privacy from "./Privacy";
  import License from "./License";
  import MetaChips from "./MetaChips";
  import EntryNavMixin from "./EntryNavMixin";
  import EntryMixin from "./EntryMixin";
  import FullEntryMixin from "./FullEntryMixin";

  export default {
    name: "EntryView",
    mixins: [EntryNavMixin, EntryMixin, FullEntryMixin],
    components: {
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
      Privacy, License,
      MetaChips
    }
  }
</script>

<style scoped>

</style>
