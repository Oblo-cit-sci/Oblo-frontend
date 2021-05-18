<template lang="pug">
  v-container.pt-1(justify-center align-center v-if="entry")
    v-row(v-if="show_back_button")
      v-btn.my-auto(@click="back_button_function" text small)
        v-icon mdi-arrow-left-thick
      span.my-auto {{template.title}}
    v-row
      v-col.pt-2(xs12 md12)
        Title_Description(
          dc_title
          :title="entry_title"
          header_type="h3"
          :description="template.description"
          :mode="mode")
          span.ml-1(:style="{'color': draft_color}") {{is_draft ? "[" + $t('comp.entrypreview.draft') +"]" : ""}}
    v-row
      v-col(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
    .ml-3(v-if="is_view_mode")
      v-row(:style="{'text-align': 'right', 'font-size':'80%'}")
        span.my-auto {{$t("comp.entrypreview.created")}} {{entry_date}}
      v-row
        MetaChips(:meta_aspects="meta_aspect_chips")
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
      v-row()
        v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
          AspectSet(v-if="logged_in" :aspects="meta_aspects" :mode="license_privacy_mode" :values.sync="meta_aspects_values" :compact="true")
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
    v-row(v-if="show_visitor_message")
      v-col.pl-0(:cols="base_cols")
        v-alert(color="red" type="warning" outlined dense)
          b {{$t("comp.entry_action_buttons.not_logged_in.title")}}
          div
            span {{$t("comp.entry_action_buttons.not_logged_in.text")}}
            a(href="https://creativecommons.org/share-your-work/public-domain/cc0/" target="_blank")  {{$t("comp.entry_action_buttons.not_logged_in.cc_ref_text")}}
    v-row
      // checkout FullEntryMixin for the mode switch (eventually changing language)
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
import {draft_color, EDIT, ENTRY, META, REJECTED, VIEW} from "~/lib/consts";
import {privacy_color, privacy_icon} from "~/lib/util";
import ChangedAspectNotice from "./ChangedAspectNotice";
import MetaChips from "./MetaChips";
import EntryActorList from "./EntryActorList";
import Taglist from "~/components/global/Taglist"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import EntryTags from "~/components/entry/EntryTags"
import AspectSetMixin from "~/components/aspects/AspectSetMixin"
import {CREATOR} from "~/lib/actors"
import LanguageChip from "~/components/language/LanguageChip";
import TemplateHelperMixin from "~/components/templates/TemplateHelperMixin";
import AspectSet from "~/components/AspectSet";
import {unpack} from "~/lib/aspect";

export default {
  name: "Entry",
  mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, TypicalAspectMixin, PersistentStorageMixin,
    FullEntryMixin, AspectSetMixin, TemplateHelperMixin],
  components: {
    AspectSet,
    LanguageChip,
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
    is_dirty: Boolean,
    show_back_button: Boolean,
    back_button_function: {
      type: Function
    }
  },
  created() {
    this.set_aspects([this.asp_entry_roles()])
    if (this.is_draft && this.is_edit_mode) {
      this.check_creator_switch()
      // this.check_language_switch()
    }
  },
  data() {
    return {
      entry_complete: false,
      router_next: null,
      delete_entry: false,
      disabled_aspects: {},
      meta_aspects_values: {"privacy": {value: this.entry.privacy}, license: {value: this.entry.license}}
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
            // const orig_user = creator.actor.public_name
            creator.actor = {public_name, registered_name}
            this.$store.commit("entries/_set_entry_value", {
              aspect_loc: [[EDIT, this.uuid], ["meta", "actors"]],
              value: roles
            })
          }
        })
      }
    }
  },
  computed: {
    ...mapGetters({logged_in: "user/logged_in", user: "user"}),
    draft_color() {
      return draft_color
    },
    show_visitor_message() {
      return this.is_edit_mode && this.can_edit && !this.logged_in
    },
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
    // TODO should go to a mixin
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
    meta_aspect_chips() {
      let result = []
      result.push({
        icon: privacy_icon(this.entry.privacy),
        name: this.entry.privacy,
        color: privacy_color(this.entry.privacy)
      })
      result.push({name: `${this.$t("comp.entry.license")}: ${this.entry.license}`})
      if(this.entry.status === REJECTED) {
        result.push({name: this.$t("comp.entry.rejected"), color: "red"})
      }
      result.push({name: this.$t(`lang.${this.entry.language}`), color: "yellow"})
      return result
    },
    show_image() {
      return this.entry.image
    },
    show_tags() {
      return this.entry.tags && Object.keys(this.entry.tags).length > 0
    },
    allow_download() {
      console.log("allow_download", this.$_.get(this.template.rules, "allow_download", true))
      return this.$_.get(this.template.rules, "allow_download", true)
    },
    entry_actions_props() {
      // console.log("update actions props")
      return {
        entry: this.entry,
        mode: this.mode,
        entry_complete: this.entry_complete,
        // todo not great cuz the mixin for that is AspectSetMixin is in Entry
        has_errors: this.has_errors,
        is_dirty: this.is_dirty,
        allow_download: this.allow_download
      }
    }
  },
  watch: {
    meta_aspects_values: {
      deep: true,
      handler: function (values) {
        // todo why does prev, return the same as values
        // console.log(values.privacy.value, prev.privacy)
        for (let aspect_name of Object.keys(values)) {
          // console.log(aspect_name)
          // console.log(values[aspect_name], prev[aspect_name])
          if (!this.$_.isEqual(values[aspect_name], this.entry[aspect_name])) {
            // console.log(aspect_name)
            this.$store.commit("entries/_set_entry_value", {
              aspect_loc: [[EDIT, this.uuid], [META, aspect_name]],
              value: unpack(values[aspect_name])
            })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
