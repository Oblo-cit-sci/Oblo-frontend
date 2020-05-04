<template lang="pug">
  v-container(justify-center align-center v-if="entry")
    v-row
      v-col(xs12 md12)
        Title_Description(
          :title="entry_title"
          header_type="h1"
          :description="template.description"
          :mode="mode")
    v-row
      v-col(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
    div(v-if="is_view_mode")
      v-row
        MetaChips(:meta_aspects="meta_aspects_privacy")
      v-row
        EntryActorList.mt-2(:actors="actors")
      v-row
        Taglist(v-if="show_tags" :tags="tags" :slide="false")
      v-row(justify="center" v-if="entry_image")
        v-col.col-md-10.col-sm-12(cols=12 alignSelf="center")
          v-img.float-md-right.float-sm-left.entry-display-size(
            contain
            :src="entry_image"
            max-height="500")
    div(v-else)
      v-row
        EntryActorList.mt-2(:actors="actors")
    v-row
      v-col(:cols="base_cols")
        v-divider.wide_divider(v-if="is_first_page")
    v-row
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h2"
          :description="page_info.description"
          :mode="mode")
    br
    v-row(v-for="(aspect) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols")
        Aspect(
          :aspect="aspect"
          :aspect_loc="aspect_locs[aspect.name]"
          :extra="aspect_extras"
          :mode="mode")
    div(v-if="is_first_page && is_edit_mode")
      v-row
        v-col(:cols="base_cols")
          v-divider.wide_divider
      v-row(v-if="logged_in")
        v-col(alignSelf="stretch" :cols="base_cols" :lg="base_cols/2" :xl="base_cols/3")
          Aspect(:aspect="license_aspect" :aspect_loc="aspect_locs[license_aspect.name]" :mode="license_privacy_mode")
        v-col(alignSelf="stretch" :cols="base_cols" :lg="base_cols/2")
          Aspect(:aspect="privacy_aspect" :aspect_loc="aspect_locs[privacy_aspect.name]" :mode="license_privacy_mode")
      v-row(v-if="is_creator")
        v-col.pb-0(alignSelf="stretch" :cols="base_cols")
          Aspect(:aspect="entry_roles_aspect" :aspect_loc="aspect_locs[entry_roles_aspect.name]" :extra="{entry_is_private: entry.privacy==='private'}")
      v-row
        v-col(alignSelf="stretch" :cols="base_cols")
          v-divider
    div(v-if="show_validation_comp")
      v-row(v-if="last_page")
        MissingAspectsNotice(:entry="entry" :template_slug="template_slug" v-model="entry_complete")
      v-row(v-if="is_dirty")
        ChangedAspectNotice(:is_draft="is_draft")
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
  v-container(v-else)
    div no uuid
</template>

<script>

  import {mapGetters} from "vuex"
  import DecisionDialog from "../util/DecisionDialog";
  import Aspect from "../Aspect";
  import EntryActions from "./EntryActions";
  import Title_Description from "../util/Title_Description";
  import EntryNavMixin from "../EntryNavMixin";
  import EntryMixin from "./EntryMixin";
  import FullEntryMixin from "./FullEntryMixin";
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import PersistentStorageMixin from "../util/PersistentStorageMixin";
  import MissingAspectsNotice from "./MissingAspectsNotice";
  import {ENTRIES_GET_EDIT, ENTRIES_GET_ENTRY} from "~/store/entries";
  import {EDIT, ENTRY, PRIVATE_LOCAL, VIEW} from "~/lib/consts";
  import {entry_roles_aspect, license_aspect, privacy_aspect} from "~/lib/typical_aspects";
  import {privacy_icon} from "~/lib/util";
  import ChangedAspectNotice from "./ChangedAspectNotice";
  import MetaChips from "./MetaChips";
  import EntryActorList from "./EntryActorList";
  import {TEMPLATES_TYPE} from "~/store/templates";
  import {USER_LOGGED_IN} from "~/store/user"
  import Taglist from "~/components/global/Taglist"
  import ActorChip from "~/components/actor/ActorChip"

  export default {
    name: "Entry",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      ActorChip,
      Taglist,
      EntryActorList,
      MetaChips,
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
      ...mapGetters({logged_in: USER_LOGGED_IN}),
      aspect_loc() {
        if (this.is_edit_mode) {
          return [EDIT, this.uuid]
        } else {
          return [ENTRY, this.uuid]
        }
      },
      show_validation_comp() {
        return this.is_edit_mode || this.is_review_mode
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
      license_privacy_mode() {
        if (!this.logged_in ||  !this.is_creator) {
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
        const edit_entry = this.$_.omit(this.$store.getters[ENTRIES_GET_EDIT](), ["local"])
        const original_entry = this.$_.omit(this.$store.getters[ENTRIES_GET_ENTRY](this.uuid), ["local"])
        // for (let k in edit_entry) {
        //   if (!this.$_.isEqual(edit_entry[k], original_entry[k]))
        //     console.log(k, this.$_.isEqual(edit_entry[k], original_entry[k]))
        //   if (!original_entry.hasOwnProperty(k))
        //     console.log("new", k)
        // }
        // for (let k in original_entry) {
        //   if (!edit_entry.hasOwnProperty(k))
        //     console.log("del", k)
        // }
        return !this.$_.isEqual(edit_entry, original_entry)
      },
      show_tags() {
        return this.entry.tags && Object.keys(this.entry.tags).length > 0
      },
    }
  }
</script>

<style scoped>

</style>
