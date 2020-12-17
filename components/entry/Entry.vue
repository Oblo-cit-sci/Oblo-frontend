<template lang="pug">
  v-container.pt-1(justify-center align-center v-if="entry")
    v-row
      v-col.pt-2(xs12 md12)
        Title_Description(
          dc_title
          :title="entry_title"
          header_type="h1"
          :description="template.description"
          :mode="mode")
          span.ml-1.blue--text {{is_draft ? "[" + $t('comp.entrypreview.draft') +"]" : ""}}
    v-row
      v-col(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
    .ml-3(v-if="is_view_mode")
      v-row(:style="{'text-align': 'right', 'font-size':'80%'}")
        span.my-auto {{$t("comp.entrypreview.created")}} {{entry_date}}
      v-row
        MetaChips(:meta_aspects="meta_aspects")
      v-row
        EntryActorList.mt-2(:actors="actors")
      v-row
        Taglist(:tags="tags")
      v-row(justify="center" v-if="entry_image")
        v-col(cols=6 sm=4 md=10 alignSelf="center")
          v-img.entry-display-size(
            position="left"
            contain
            :src="entry_image"
            max-height="300")
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
    v-row(v-for="(aspect) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
        v-scroll-y-transition
          Aspect(
            :aspect="aspect"
            :aspect_loc="aspect_locs[aspect.name]"
            :extra="aspect_extras"
            @aspectAction="aspectAction($event)"
            :mode="mode")
    div(v-if="is_first_page && is_editable_mode")
      v-row
        v-col(:cols="base_cols")
          v-divider.wide_divider
      v-row(v-if="logged_in")
        v-col(alignSelf="stretch" :cols="base_cols" :lg="base_cols/2" :xl="base_cols/3")
          Aspect(:aspect="license_aspect" :aspect_loc="aspect_locs[license_aspect.name]" :mode="license_privacy_mode")
        v-col(alignSelf="stretch" :cols="base_cols" :lg="base_cols/2")
          Aspect(:aspect="asp_privacy()" :aspect_loc="aspect_locs[asp_privacy().name]" :mode="license_privacy_mode")
      v-row(v-if="is_creator || is_admin")
        v-col.pb-0(alignSelf="stretch" :cols="base_cols")
          Aspect(:aspect="asp_entry_roles()" :mode="entry_roles_mode" :aspect_loc="aspect_locs[asp_entry_roles().name]" :extra="{entry_is_private: entry.privacy==='private'}" @update:error="update_error('actors', $event)")
      v-row
        v-col(alignSelf="stretch" :cols="base_cols")
          v-divider
    div(v-if="show_validation_comp")
      v-row(v-if="last_page")
        EntryValidation(:entry="entry" :template_slug="template_slug" v-model="entry_complete")
      v-row(v-if="is_dirty")
        ChangedAspectNotice(:is_draft="is_draft")
    v-row(v-if="is_edit_mode && can_edit && !logged_in")
      v-col.pl-0(:cols="base_cols")
        v-alert(color="info" type="warning")
          b {{$t("comp.entry_action_buttons.not_logged_in.title")}}
          div
            span {{$t("comp.entry_action_buttons.not_logged_in.text")}}
            a(href="https://creativecommons.org/share-your-work/public-domain/cc0/" target="_blank" style="color:white")  {{$t("comp.entry_action_buttons.not_logged_in.cc_ref_text")}}
    v-row
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        @entry-action="entryAction($event)"
        @mode="mode=$event")
  v-container(v-else)
    div
</template>

<script>

import {mapGetters} from "vuex"
import Aspect from "../Aspect";
import EntryActions from "./EntryActions";
import Title_Description from "../util/Title_Description";
import EntryNavMixin from "../EntryNavMixin";
import EntryMixin from "./EntryMixin";
import FullEntryMixin from "./FullEntryMixin";
import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import EntryValidation from "./EntryValidation";
import {DRAFT, EDIT, ENTRY, REVIEW, VIEW} from "~/lib/consts";
import {privacy_color, privacy_icon} from "~/lib/util";
import ChangedAspectNotice from "./ChangedAspectNotice";
import MetaChips from "./MetaChips";
import EntryActorList from "./EntryActorList";
import Taglist from "~/components/global/Taglist"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import EntryTags from "~/components/entry/EntryTags"
import AspectSetMixin from "~/components/aspects/AspectSetMixin"
import {CREATOR} from "~/lib/actors"

export default {
  name: "Entry",
  mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, TypicalAspectMixin, PersistentStorageMixin,
    FullEntryMixin, AspectSetMixin],
  components: {
    EntryTags,
    Taglist,
    EntryActorList,
    MetaChips,
    ChangedAspectNotice,
    EntryValidation,
    Aspect,
    EntryActions,
    Title_Description,
  },
  props: {
    is_dirty: Boolean
  },
  created() {
    this.set_aspects([this.asp_entry_roles()])
    this.check_creator_switch()
  },
  data() {
    return {
      entry_complete: false,
      router_next: null,
      delete_entry: false,
      disabled_aspects: {}
    }
  },
  methods: {
    aspectAction(aspect_action) {

    },
    entryAction(action) {
      // console.log("received entry-A", action)
      if (action === "delete") {
        this.delete_entry = true
      }
    },
    check_creator_switch() {
      if (this.entry.status === DRAFT && this.mode === EDIT) {
        const roles = this.$_.cloneDeep(this.entry.actors)
        const creator = roles.find(ea => ea.role === CREATOR)
        if (creator.actor.registered_name !== this.username) {
          // ${creator.actor.public_name}
          this.$bus.$emit("dialog-open", {
            data: {
              cancel_text: this.$t("comp.entry.creator_switch_dialog.cancel_text"),
              title: this.$t("comp.entry.creator_switch_dialog.title"),
              text: this.$t("comp.entry.creator_switch_dialog.text",
                {original: creator.actor.public_name, user: this.user.public_name})
            },
            cancel_method: () => {
              this.$router.back()
            },
            confirm_method: () => {
              const {public_name, registered_name} = this.user
              const orig_user = creator.actor.public_name
              creator.actor = {public_name, registered_name}
              this.$store.commit("entries/_set_entry_value", {
                aspect_loc: [[EDIT, this.uuid], ["meta", "actors"]],
                value: roles
              })
            }
          })
          // this.ok_snackbar(`Creator changed to ${creator.actor.public_name}`)
        }
      }
    }
  },
  computed: {
    ...mapGetters({logged_in: "user/logged_in", user: "user"}),
    aspect_loc() {
      if (this.is_editable_mode) {
        return [EDIT, this.uuid]
      } else {
        return [ENTRY, this.uuid]
      }
    },
    show_validation_comp() {
      return this.is_edit_mode || this.is_review_mode
    },
    license_aspect() {
      return this.asp_license("license", ["cc_licenses"], null)
    },
    license_privacy_mode() {
      if (this.logged_in && this.is_creator || this.$store.getters["user/is_admin"]) {
        return EDIT
      } else {
        return VIEW
      }
    },
    entry_roles_mode() {
      if (this.is_creator) {
        return EDIT
      } else {
        return VIEW
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
    meta_aspects() {
      let result = []
      result.push({
        icon: privacy_icon(this.entry.privacy),
        name: this.entry.privacy,
        color: privacy_color(this.entry.privacy)
      })
      result.push({name: "License: " + this.entry.license})
      return result
    },
    show_image() {
      return this.entry.image
    },
    show_tags() {
      return this.entry.tags && Object.keys(this.entry.tags).length > 0
    },
    entry_actions_props() {
      // console.log("update actions props")
      return {
        entry: this.entry,
        mode: this.mode,
        entry_complete: this.entry_complete,
        // todo not great cuz the mixin for that is AspectSetMixin is in Entry
        has_errors: this.has_errors,
        is_dirty: this.is_dirty
      }
    }
  }
}
</script>

<style scoped>

</style>
