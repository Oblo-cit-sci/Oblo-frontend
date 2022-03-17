<template lang="pug">
  v-container.pt-1#start(justify-center align-center v-if="entry")
    v-row
      v-col.pt-2(xs12 md12)
        Title_Description(v-bind="entry_title_description_props")
          span.ml-1(:style="{'color': draft_color}") {{is_draft ? "[" + $t('comp.entrypreview.draft') +"]" : ""}}
    div
      v-row
        EntryActorList.mt-2(:actors="actors")
    v-row
      v-col(:cols="base_cols")
        v-divider.wide_divider(v-if="is_first_page")
    v-row
      div(v-if="has_defined_pages")
        Title_Description(v-bind="page_title_description_props(current_page_info)")
    v-row(v-for="(aspect) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
        <!-- TODO how to keep this slimmer ?! -->
        v-scroll-y-transition
          Aspect(
            v-bind="edit_regular_aspect_props(aspect)"
            @aspectAction="aspectAction($event)"
            @update:ext_value="update_ext_value(aspect.name, $event)")
    div(v-if="is_last_page")
      v-row
        v-col(:cols="base_cols")
          v-divider.wide_divider
      v-row
        v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
          AspectSet(
            v-if="logged_in"
            v-bind="meta_aspects_props"
            :values.sync="meta_aspects_values")
      v-row(v-if="is_creator || is_admin")
        v-col.pb-0(alignSelf="stretch" :cols="base_cols")
          Aspect(
            v-bind="meta_aspect_actors_props"
            :ext_value.sync="actors_value"
            @update:error="update_error('actors', $event)")
      v-row
        v-col(alignSelf="stretch" :cols="base_cols")
          v-divider
    div
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
import EntryFullMixin from "~/components/entry/EntryFullMixin"
import Aspect from "~/components/Aspect"
import EntryActorList from "~/components/entry/EntryActorList"
import Title_Description from "~/components/util/Title_Description"
import {ACTORS, EDIT, PRIVATE, VIEW} from "~/lib/consts"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import {pack_value} from "~/lib/aspect"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import EntryValidation from "~/components/entry/EntryValidation"
import ChangedAspectNotice from "~/components/entry/ChangedAspectNotice"
import EntryNavMixin from "~/components/EntryNavMixin"
import EntryActions from "~/components/entry/EntryActions"
import {recursive_unpack2} from "~/lib/util"
import {edit_mode_question_only} from "~/lib/template"
import {BUS_DIALOG_OPEN} from "~/plugins/bus"
import {get_creator} from "~/lib/entry"
import {CREATOR} from "~/lib/actors"

/***
 * EntryNavMixin only for the can_edit
 */

export default {
  name: "EntryFullEdit",
  components: {Aspect, ChangedAspectNotice, EntryActions, EntryActorList, EntryValidation, Title_Description},
  mixins: [EntryFullMixin, EntryNavMixin, PersistentStorageMixin, TypicalAspectMixin],
  props: {
    is_dirty: Boolean,
  },
  data() {
    return {
      mode: EDIT,
      meta_aspects_values: {
        privacy: pack_value(this.entry.privacy),
        license: pack_value(this.entry.license),
        language: pack_value(this.entry.language)
      }
    }
  },
  computed: {
    ...mapGetters({is_admin: "user/is_admin", logged_in: "user/logged_in", user: "user"}),
    edit_mode_question_only() {
      return edit_mode_question_only(this.template)
    },
    entry_roles_mode() {
      if (this.is_creator) {
        return EDIT
      } else {
        return VIEW
      }
    },
    meta_aspect_actors_props() {
      return {
        aspect: this.asp_entry_roles(),
        mode: this.entry_roles_mode,
        entry_uuid: this.uuid,
        is_entry_meta: true,
        extra: {
          entry_is_private: this.entry.privacy === PRIVATE
        }
      }
    },
    meta_aspects_props() {
      return {
        aspects: this.meta_aspects,
        modes: this.meta_aspect_modes,
        entry_uuid: this.uuid,
        compact: true
      }
    },
    show_visitor_message() {
      return this.is_last_page && this.is_edit_mode && this.can_edit && !this.logged_in
    },
  },
  created() {
    if (this.is_draft) {
      this.check_creator_switch()
    }
  },
  methods: {
    aspectAction(aspect_action) {
    },
    check_creator_switch() {
      const creator = get_creator(this.entry)
      // todo, was just this.username (how do we get that? which mixin?)
      if (creator.registered_name !== this.user.registered_name) {
        // ${creator.actor.public_name}
        this.$bus.$emit(BUS_DIALOG_OPEN, {
          data: {
            cancel_text: this.$t("comp.entry.creator_switch_dialog.cancel_text"),
            title: this.$t("comp.entry.creator_switch_dialog.title"),
            text: this.$t("comp.entry.creator_switch_dialog.text",
              {original: creator.public_name, user: this.user.public_name})
          },
          cancel_method: () => {
            this.$router.back()
          },
          confirm_method: () => {
            const roles = this.$_.cloneDeep(this.entry.actors)
            const creator_role = roles.find(entry_role => entry_role.role === CREATOR)
            const {public_name, registered_name} = this.user
            const rrr = {public_name, registered_name} = this.user
            console.log(rrr)
            creator_role.actor = {public_name, registered_name}
            this.$store.commit("entries/set_edit_meta_value", {
              meta_aspect_name: ACTORS,
              value: roles
            })
          }
        })
      }
    },
    edit_regular_aspect_props(aspect) {
      return {
        aspect,
        ext_value: this.aspect_mvalue(aspect.name),
        entry_uuid: this.uuid,
        conditionals: this.regular_values,
        question_only: this.edit_mode_question_only,
        extra: this.aspect_extras,
        mode: EDIT
      }
    },
    update_error(aspect_name, error) {
      // console.log("error update", aspect_name, error)
      this.errors[aspect_name] = error
    },
    update_ext_value(aspect_name, value) {
      this.$store.commit("entries/new_set_edit_entry_value", {aspect_name, value})
      // todo maybe bounce...
      this.persist_edit_entry().then()
    },
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
