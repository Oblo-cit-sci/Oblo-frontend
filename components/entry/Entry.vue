<template lang="pug">
  v-container.pt-1#start(justify-center align-center v-if="entry")
    v-row(v-if="show_back_button")
      v-btn.my-auto(@click="back_button_function" outlined raised)
        v-icon mdi-arrow-left-thick
      span.my-auto {{template.title}}
    v-row
      v-col.pt-2(xs12 md12)
        Title_Description(
          dc_title
          :title="entry_title"
          header_type="h3"
          :description="get_description"
          description_as_html=true
          :mode="mode")
          span.ml-1(:style="{'color': draft_color}") {{is_draft ? "[" + $t('comp.entrypreview.draft') +"]" : ""}}
    v-row
    .ml-3(v-if="is_view_mode")
      v-row(:style="{'text-align': 'right', 'font-size':'80%'}")
        span.my-auto {{$t("comp.entrypreview.created")}} {{entry_date}}
      v-row
        MetaChips(:meta_aspects="meta_aspect_chips")
      v-row
        v-col.px-0.py-1(cols=12)
          EntryActorList.mt-2(:actors="actors")
      v-row(v-if="is_template_outdated")
        v-col.px-0.py-1(cols=12)
          OutdatedChip
      v-row
        v-col.px-0.py-1(cols=12)
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
      div(v-if="has_defined_pages")
        Title_Description(
          :title="current_page_info.title"
          header_type="h2"
          :description="current_page_info.description"
          :mode="mode")
    v-row(v-for="(aspect) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
        <!-- TODO how to keep this slimmer ?! -->
        v-scroll-y-transition(v-if="is_editable_mode")
          Aspect(
            :aspect="aspect"
            :ext_value="aspect_mvalue(aspect.name)"
            :entry_uuid="uuid"
            :conditionals="regular_values"
            :extra="aspect_extras"
            @aspectAction="aspectAction($event)"
            @update:ext_value="update_ext_value(aspect.name, $event)"
            :mode="mode")
        Aspect(v-else
        :aspect="aspect"
          :entry_uuid="uuid"
          :ext_value="aspect_mvalue(aspect.name)"
          :conditionals="regular_values"
          :extra="aspect_extras"
          @aspectAction="aspectAction($event)"
          :mode="mode")
    div(v-if="is_last_page && is_editable_mode")
      v-row
        v-col(:cols="base_cols")
          v-divider.wide_divider
      v-row()
        v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
          AspectSet(
            v-if="logged_in"
            :aspects="meta_aspects"
            :modes="meta_aspect_modes"
            :values.sync="meta_aspects_values"
            entry_uuid="uuid"
            :compact="true")
      v-row(v-if="is_creator || is_admin")
        v-col.pb-0(alignSelf="stretch" :cols="base_cols")
          Aspect(
            :aspect="asp_entry_roles()"
            :mode="entry_roles_mode"
            :entry_uuid="uuid"
            :is_entry_meta="true"
            :ext_value.sync="actors_value"
            :extra="{entry_is_private: entry.privacy==='private'}"
            @update:error="update_error('actors', $event)")
      v-row
        v-col(alignSelf="stretch" :cols="base_cols")
          v-divider
    div(v-if="show_validation_comp")
      v-row(v-if="is_last_page")
        EntryValidation(:entry="entry" :template="template" v-model="entry_complete")
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
        :conditionals="regular_values"
        @mode="mode=$event") // see FullEntryMixin computed mode
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
import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import EntryValidation from "./EntryValidation";
import {ACTORS, draft_color, EDIT, ENTRY, META, REJECTED, VIEW} from "~/lib/consts";
import {privacy_color, privacy_icon, recursive_unpack2} from "~/lib/util";
import ChangedAspectNotice from "./ChangedAspectNotice";
import MetaChips from "./MetaChips";
import EntryActorList from "./EntryActorList";
import Taglist from "~/components/global/Taglist"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import EntryTags from "~/components/entry/EntryTags"
import AspectSetMixin from "~/components/aspects/AspectSetMixin"
import {CREATOR} from "~/lib/actors"
import LanguageChip from "~/components/language/LanguageChip";
import AspectSet from "~/components/AspectSet";
import {pack_value, unpack} from "~/lib/aspect";
import {BUS_DIALOG_OPEN} from "~/plugins/bus";
import OutdatedChip from "~/components/tag/OutdatedChip"
import goTo from 'vuetify/lib/services/goto'
import {unsaved_changes_default_dialog} from "~/lib/dialogs"

export default {
  name: "Entry",
  mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, TypicalAspectMixin, PersistentStorageMixin,
    AspectSetMixin],
  components: {
    OutdatedChip,
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
    },
    entry_navigation_props: {
      type: Object,
      default: () => {
      }
    }
  },
  created() {
    // console.log("Entry - created", this.entry.uuid)
    this.set_aspects([this.asp_entry_roles()])
    if (this.is_draft && this.is_edit_mode) {
      this.check_creator_switch()
    }
    this.map_goto(this.uuid)
  },
  data() {
    return {
      entry_complete: false,
      router_next: null,
      delete_entry: false,
      disabled_aspects: {},
      meta_aspects_values: {
        privacy: pack_value(this.entry.privacy),
        license: pack_value(this.entry.license),
        language: pack_value(this.entry.language)
      },
      unsaved_changes_dialog: unsaved_changes_default_dialog,
    }
  },
  methods: {
    aspectAction(aspect_action) {
    },
    aspect_mvalue(aspect_name) {
      return this.entry.values[aspect_name]
    },
    update_ext_value(aspect_name, value) {
      // console.log("update_ext_value", aspect_name, value)
      this.$store.commit("entries/new_set_edit_entry_value", {aspect_name, value})
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
        this.$bus.$emit(BUS_DIALOG_OPEN, {
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
            this.$store.commit("entries/set_edit_meta_value", {
              meta_aspect_name: ACTORS,
              value: roles
            })
          }
        })
      }
    },
  },
  computed: {
    ...mapGetters({logged_in: "user/logged_in", user: "user"}),
    draft_color() {
      return draft_color
    },
    mode: {
      get() {
        return this.$route.query.entry_mode || VIEW
      },
      set(mode) {
        if (mode === EDIT) {
          if (this.entry.language !== this.$store.getters.domain_language) {
            this.$bus.$emit(BUS_DIALOG_OPEN, {
              data: {
                cancel_text: this.$t("comp.entry.language_switch_dialog.cancel_text"),
                title: this.$t("comp.entry.language_switch_dialog.title"),
                text: this.$t("comp.entry.language_switch_dialog.text",
                  {language: this.$t("lang." + this.entry.language)})
              },
              cancel_method: () => {
              },
              confirm_method: async () => {
                await this.change_language(this.entry.language)
                this.to_entry(this.uuid, mode, {}, true)
              }
            })
          } else {
            this.to_entry(this.uuid, mode, {}, true)
          }
        } else {
          this.to_entry(this.uuid, mode, {}, true)
        }
      }
    },
    show_visitor_message() {
      return this.is_last_page && this.is_edit_mode && this.can_edit && !this.logged_in
    },
    get_description() {
      const long_description = this.template.values?.long_description
      if (long_description)
        return long_description
      return this.template.description
    },
    show_validation_comp() {
      return this.is_edit_mode || this.is_review_mode
    },
    license_aspect() {
      return this.asp_license("license", ["cc_licenses"], null)
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
    // wrong, create should be for all that are not local/saved or published
    meta_aspect_chips() {
      let result = []
      result.push({
        icon: privacy_icon(this.entry.privacy),
        name: this.entry.privacy,
        color: privacy_color(this.entry.privacy)
      })
      result.push({name: `${this.$t("comp.entry.license")}: ${this.entry.license}`})
      if (this.entry.status === REJECTED) {
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
    meta_aspects_privacy() {
      let result = []
      result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
      result.push({name: "License: " + this.entry.license})
      return result
    },
    allow_download() {
      // console.log("allow_download", this.$_.get(this.template.rules, "allow_download", true))
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
    page() {
      setTimeout(() => {
        goTo("#app")
      }, 200)
    },
    meta_aspects_values: {
      deep: true,
      handler: function (values) {
        const unpacked_values = recursive_unpack2(values)
        for (let aspect_name of Object.keys(unpacked_values)) {
          if (!this.$_.isEqual(unpacked_values[aspect_name], this.entry[aspect_name])) {
            this.$store.commit("entries/set_edit_meta_value", {
              meta_aspect_name: aspect_name,
              value: unpacked_values[aspect_name]
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
