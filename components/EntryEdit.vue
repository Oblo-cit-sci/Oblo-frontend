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
        v-col(alignSelf="stretch" :cols="base_cols" :lg="base_cols/2")
          Aspect(:aspect="license_aspect" :aspect_loc="aspect_locs[license_aspect.name]" :extra="aspect_extras" :mode="mode")
        v-col(alignSelf="stretch" :cols="base_cols" :lg="base_cols/2")
          Aspect(:aspect="privacy_aspect" :aspect_loc="aspect_locs[privacy_aspect.name]" :mode="mode")
      v-row
        v-col(alignSelf="stretch" :cols="base_cols")
          Aspect(:aspect="entry_roles_aspect" :aspect_loc="aspect_locs[entry_roles_aspect.name]" :extra="{entry_is_private: entry.privacy==='private'}")
      v-divider(v-if="is_first_page" class="wide_divider")
    v-row(v-if="last_page")
      MissingAspectsNotice(:entry="entry" :template_slug="template_slug" v-model="entry_complete")
    v-row(v-if="is_dirty")
      ChangedAspectNotice
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
  import EntryNavMixin from "./EntryNavMixin";
  import EntryMixin from "./EntryMixin";
  import FullEntryMixin from "./FullEntryMixin";
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
  import PersistentStorageMixin from "./PersistentStorageMixin";
  import MissingAspectsNotice from "./entry/MissingAspectsNotice";
  import {ENTRIES_GET_EDIT, ENTRIES_GET_ENTRY, ENTRIES_VALUE} from "../store/entries";
  import {EDIT, ENTRY, PRIVATE_LOCAL, VIEW} from "../lib/consts";
  import {entry_roles_aspect, license_aspect, privacy_aspect} from "../lib/typical_aspects";
  import {privacy_icon} from "../lib/util";
  import ChangedAspectNotice from "./entry/ChangedAspectNotice";
  import {TEMPLATES_TYPE} from "../store/templates";

  export default {
    name: "EntryEdit",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      ChangedAspectNotice,
      MissingAspectsNotice,
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
    },
    data() {
      return {
        entry_complete: false,
        router_next: null,
        delete_entry: false
      }
    },
    methods: {
      entryAction(action) {
        if (action === "delete") {
          this.delete_entry = true
        }
      }
    },
    computed: {
      entry() {
        return this.$store.getters[ENTRIES_GET_EDIT]()
      },
      aspect_loc() {
        return [EDIT, this.uuid]
      },

      license_aspect() {
        return license_aspect(this.$store, ["cc_licenses"], [])
      },
      privacy_aspect() {
        return privacy_aspect(this.$store)
      },
      entry_roles_aspect() {
        return entry_roles_aspect(this.$store)
      },
      aspects() {
        return this.$store.getters[TEMPLATES_TYPE](this.template_slug).aspects
      },
      licence_mode() {
        if (this.entry.refs.parent || this.entry.privacy === PRIVATE_LOCAL) {
          return VIEW
        } else {
          return EDIT
        }
      },
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      page_info() {
        //console.log(this.template, this.page, this.template.rules.pages[this.page])
        if (this.has_pages)
          return this.template.rules.pages[this.page]
        else
          return null
      },
      // wrong, create should be for all that are not local/saved or published
      meta_aspects_privacy() {
        let result = []
        result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
        result.push({name: "License: " + this.entry.license})
        return result
      },
      show_image() {
        return this.entry.image
      },
      is_dirty() {
        console.log("dirt check")
        const edit_entry = this.$store.getters[ENTRIES_GET_EDIT]()
        const original_entry = this.$store.getters[ENTRIES_GET_ENTRY](this.uuid)
        // todo local might disturb that
        // console.log(edit_entry, original_entry)
        for(let k in edit_entry) {
          console.log(k, this.$_.isEqual(edit_entry[k], original_entry[k]))
        }
        return !this.$_.isEqual(edit_entry, original_entry)
      },
    }
  }
</script>

<style scoped>

</style>
