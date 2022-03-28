<template lang="pug">
  v-container.pt-1#start(justify-center align-center v-if="entry")
    v-row(v-if="show_back_button")
      v-btn.my-auto(@click="back_button_function" outlined raised)
        v-icon mdi-arrow-left-thick
      span.my-auto {{template.title}}
    v-row
      v-col.pt-2.pb-0(xs12 md12)
        Title_Description(v-bind="entry_title_description_props")
          span.ml-1(:style="{'color': draft_color}") {{is_draft ? "[" + $t('comp.entrypreview.draft') +"]" : ""}}
    v-row.pl-3(:style="{'font-size':'80%'}")
      span.my-auto {{$t("comp.entrypreview.created")}} {{entry_date}}
    v-row.pl-3.py-1
      MetaChips(:meta_aspects="meta_aspect_chips")
    v-row
      v-col.pl-2.py-0(cols=12)
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
    v-row
      v-col(:cols="base_cols")
        v-divider.wide_divider(v-if="is_first_page")
    v-row(v-for="(aspect, aspect_index) in shown_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols" :style="{padding:0}")
        div
          Title_Description.ml-2(v-if="has_defined_pages" v-bind="view_page_title_description_props(aspect_index)")
          Aspect(
            v-bind="view_regular_aspect_props(aspect)"
            @aspectAction="aspectAction($event)")
    v-row
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        @entry-action="entryAction($event)")
  v-container(v-else)
    div
</template>

<script>

import EntryFullMixin from "~/components/entry/EntryFullMixin"
import {privacy_color, privacy_icon} from "~/lib/util"
import {REJECTED, VIEW} from "~/lib/consts"
import MetaChips from "~/components/entry/MetaChips"
import EntryActorList from "~/components/entry/EntryActorList"
import OutdatedChip from "~/components/tag/OutdatedChip"
import Taglist from "~/components/global/Taglist"
import Title_Description from "~/components/util/Title_Description"
import {attr} from "~/lib/aspect"
import Aspect from "~/components/Aspect"
import EntryActions from "~/components/entry/EntryActions"
import EntryNavMixin from "~/components/EntryNavMixin"
import {view_mode_hide_unset_values} from "~/lib/template"

export default {
  name: "EntryFullView",
  // EntryNavMixin just for the map goto...
  mixins: [EntryFullMixin, EntryNavMixin],
  components: {Aspect, EntryActions, EntryActorList, MetaChips, OutdatedChip, Taglist, Title_Description},
  props: {
    show_back_button: Boolean,
    back_button_function: {
      type: Function
    },
  },
  data() {
    return {
      mode: VIEW,
    }
  },
  computed: {
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
  },
  created() {
    this.map_goto(this.uuid)
  },
  methods: {
    view_page_title_description_props(aspect_index) {
      if (aspect_index === 0) {
        return this.page_title_description_props(this.pages[0])
      }
      const aspect_page = a_index => attr(this.shown_aspects[a_index]).page || 0
      const prev_aspect_page = aspect_page(aspect_index - 1)
      const current_aspect_page = aspect_page(aspect_index)
      if (current_aspect_page - prev_aspect_page === 1) {
        return this.page_title_description_props(this.pages[current_aspect_page])
      }
    },
    view_regular_aspect_props(aspect) {
      return {
        aspect,
        entry_uuid: this.uuid,
        ext_value: this.aspect_mvalue(aspect.name),
        conditionals: this.regular_values,
        extra: Object.assign({
          view_mode_hide_unset_values: this.is_view_mode && view_mode_hide_unset_values(this.template)
        }, this.aspect_extras),
        mode: VIEW
      }
    }
  }
}
</script>

<style scoped>

</style>
