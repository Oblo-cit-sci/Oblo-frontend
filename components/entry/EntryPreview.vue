<template lang="pug">
  div(v-if="!uuid")
    div
  v-card.mx-auto.custom-card(v-else outlined :style="border_style" @mouseover="title_mouseover" @mouseleave="title_mouseleave")
    v-container.pt-0.pb-0
      v-row
        v-col.main_col.px-2.pb-1(v-bind:class="[show_image ? 'col-8' : 'col-12']")
          v-row
            v-col.py-1(class="entry-meta" cols=12)
              p.subtitle-1.mb-1
                ActorAvatar(:actor="creator")
                svg.mr-1(height=15 width=15 v-if="!show_entrytype_title")
                  circle(cx=8 cy=8 r=6 :stroke="status_color" :fill="template_color" stroke-width=2)
                span(@click="view_entry(entry.uuid, 'view')"  :style="title_style")
                  span {{full_title()}}
                  span(v-if="is_draft" :style="{color:status_color}") &nbsp; [{{$t('comp.entrypreview.draft')}}]
                  span(v-if="is_requires_review" :style="{color:status_color}") &nbsp; [{{$t('comp.entrypreview.requries_review')}}]
                  <!-- CLEAN THIS OUT -->
                  v-btn(v-if="show_title_action" @click="goto()" depressed small)
                    v-icon(:class="default_action_icon")
                  LanguageChip.mb-2(v-if="show_language_chip" :language_code="entry.language" small)
          v-row.pl-3(v-if="is_template_outdated")
            OutdatedChip
          v-row.pl-3(:style="{'text-align': 'right', 'font-size':'80%'}")
            span.my-auto(v-if="show_date") {{$t("comp.entrypreview.created")}} {{entry_date}}
          v-row.pl-3.py-1(v-if="show_meta_aspects")
            MetaChips(:meta_aspects="meta_aspects")
          v-row.pl-3(justify="space-between" v-if="actor_row")
            v-col.py-0.pl-0
              ActorChip(:actor="creator")
          v-row.pl-3(v-if="show_info")
            v-list-item(v-if="outdated")
              v-list-item-icon
                v-icon(color="orange") mdi-alert-outline
              v-list-item-content {{$t("comp.entrypreview.outdated")}}
        v-col.pa-1(v-if="show_image" cols=4 class="entry-image" align-self="center")
          v-img.my-auto(class="entry-image-size"
            contain
            :src="entry_image")
      v-row.px-1(v-if="show_tags")
        v-col.px-0.pt-0.pb-1(cols=12)
          Taglist(:tags="tags" :slide="true" summarize)
    div.ml-4.mr-2
      Aspect(v-for="aspect in shown_aspects"
        :key="aspect.name"
        :aspect="aspect"
        mode="view"
        :aspect_loc="aspect_locs[aspect.name]")
    div(v-if="show_botton_actions")
      v-divider(light :style="divider_style")
      v-card-actions
        div
          v-btn(small text outlined @click="goto(entry.uuid)" :color="proper_mode_color" ) {{proper_mode_text}}
          v-btn(v-if="show_view" small text outlined @click="goto(entry.uuid, 'view')") {{$t("comp.entrypreview.view")}}
          v-btn(small text outlined :color="act.color || 'green'"
            v-for="act in additional_actions"
            :key="act.name"
            :loading="action_loading[act.name] || false"
            @click="additional_action(act.name)") {{act.title}}
            v-icon(v-if="act.icon") {{act.icon}}
            V-badge(v-if="act.badge_content" color="black" :content="act.badge_content")
</template>

<script>

import EntryNavMixin from "../EntryNavMixin";
import {privacy_color, privacy_icon} from "~/lib/util"
import {review_color, draft_color,EDIT, ENTRY, REVIEW, VIEW} from "~/lib/consts"
import MetaChips from "./MetaChips"
import Taglist from "../global/Taglist"
import MapJumpMixin from "../map/MapJumpMixin";
import EntryMixin from "./EntryMixin";
import PersistentStorageMixin from "../util/PersistentStorageMixin";
import ChildCreateMixin from "../util/ChildCreateMixin";
import {aspect_loc_str2arr, loc_prepend} from "~/lib/aspect";
import Aspect from "../Aspect";

import ActorChip from "../actor/ActorChip"
import EntryActionsMixin from "~/components/entry/EntryActionsMixin"
import EntryTags from "~/components/entry/EntryTags"
import ActorAvatar from "~/components/actor/ActorAvatar"
import LanguageCodeFallback from "~/components/aspect_utils/LanguageCodeFallback";
import LanguageChip from "~/components/language/LanguageChip";
import {BUS_MAP_MARKER_HIDE, BUS_MAP_MARKER_SHOW} from "~/plugins/bus";
import OutdatedChip from "~/components/tag/OutdatedChip"
import SlugEntryFetcher from "~/components/templates/SlugEntryFetcher";


export default {
  name: "EntryPreview",
  components: {
    OutdatedChip,
    LanguageChip, LanguageCodeFallback, ActorAvatar, EntryTags, ActorChip, Aspect, MetaChips, Taglist},
  mixins: [EntryNavMixin, MapJumpMixin, EntryMixin, SlugEntryFetcher,
    PersistentStorageMixin, ChildCreateMixin, EntryActionsMixin],
  data() {
    return {
      additional_action_loading: {},
      hover: false
    }
  },
  props: {
    show_date: {
      type: Boolean,
      default: false
    },
    show_meta_aspects: {
      type: Boolean,
      default: false
    },
    click_title_for_view: {
      type: Boolean,
      default: true
    },
    actor_row: {
      type: Boolean,
      default: false
    },
    show_botton_actions: {
      type: Boolean,
      default: false
    },
    show_entrytype_title: Boolean,
    show_language_chip: Boolean,
    include_domain_tag: Boolean,
    show_title_action: Boolean,
    prevent_view_page_change: Boolean,
    actions: {
      type: Array,
      default: () => []
    },
    show_info: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    border_style() {
      if (this.is_draft) {
        return {"border": `solid 1px ${draft_color} !important`}
      } else if (this.is_requires_review) {
        return {"border": `solid 1px ${review_color} !important`}
      }
    },
    status_color() {
      if(this.is_draft)
        return draft_color
      else if(this.is_requires_review)
        return review_color
      else
        return ""
    },
    title_style() {
      return {
        cursor: "pointer"
      }
    },
    divider_style() {
      if (this.is_draft) {
        return {"border-color": draft_color}
      } else if (this.is_requires_review) {
        return {"border-color": review_color}
      }
    },
    show_view() {
      return [EDIT, REVIEW].includes(this.proper_mode)
    },
    action_loading() {
      return this.additional_action_loading
    },
    show_image() {
      return this.entry.image // ![undefined, null, ""].includes(this.entry.image)
    },
    show_tags() {
      return this.entry.tags && Object.keys(this.entry.tags).length > 0
    },
    meta_aspects() {
      let result = []
      result.push({
        icon: privacy_icon(this.entry.privacy),
        name: this.entry.privacy,
        color: privacy_color(this.entry.privacy)
      })
      result.push({name: "License: " + this.entry.license})
      if (this.include_domain_tag) {
        result.push({name: this.$store.getters["entries/domain"](this.entry.uuid)})
      }
      if (this.entry.status === "requires_review") {
        result.unshift({icon: "mdi-file-find-outline", name: "Requires review", color: review_color()})
      }
      if (this.entry.status === "orphan") {
        result.push({name: "Orphan"})
      }
      return result
    },
    template_title() {
      const lang = this.$store.getters["user/settings"].domain_language
      return this.$store.getters["templates/template_title"](this.entry.template.slug, lang)
    },
    default_action_icon() {
      if (this.proper_mode === VIEW)
        return "fa fa-angle-right"
      else
        return "fa fa-edit"
    },
    additional_actions() {
      const pw_actions = this.$_.cloneDeep(this.template.rules.preview_actions) || []
      // console.log(this.template.slug, pw_actions)
      const show_actions = []
      if (this.outdated) {
        const download_action = this.$_.find(this.template.rules.preview_actions, a => a.type === "download")
        if (download_action)
          download_action.color = "orange"
        else
          pw_actions.unshift({name: "Download", type: "download", color: "orange"})
      }
      for (let pw_action of this.$_.concat(pw_actions, this.actions)) {
        if (pw_action.title === undefined)
          pw_action.title = pw_action.name
        if (pw_action.type === "create_child") {
          const action_aspect_loc = aspect_loc_str2arr(pw_action.aspect)
          const aspect_loc = loc_prepend(ENTRY, this.entry.uuid, action_aspect_loc)
          const value = this.$store.getters["entries/value"](aspect_loc)
          if (!value) {
            console.log("child action cannot be added, aspect location doesnt exist for action:", pw_action.name)
            continue
          }
          if (value.length === 0)
            continue
        } else if (pw_action.type === "download") {
          // show_actions.push(pw_action)
        } else if (pw_action.type === "upload") {
          // show_actions.push(pw_action)
        } else if (pw_action.type === "goto_loc") {
          if (this.num_locations === 0)
            continue
          pw_action.badge_content = this.num_locations
        }
        show_actions.push(pw_action)
      }
      return show_actions
    },
    shown_aspects() {
      // console.log(this.template)
      if (this.template) {
        const search_res = this.$store.getters["search/get_entry_aspects"](this.entry.uuid)
        return this.$_.filter(this.template.aspects, a => search_res.includes(a.name))
      } else {
        return []
      }
    }
  },
  methods: {
    title_mouseover() {
      this.$bus.$emit(BUS_MAP_MARKER_SHOW, {uuid:this.uuid})
    },
    title_mouseleave() {
      this.$bus.$emit(BUS_MAP_MARKER_HIDE, {uuid:this.uuid})
    },
    privacy_icon(privacy) {
      return privacy_icon(privacy)
    },
    goto_next_entry_location() {
      if (this.entry.location) {
        this.goto_next_location(this.entry.location, this.uuid)
      }
    },
    async view_entry() {
      if(this.is_template_outdated) {
        await this.guarantee_template_code_of_version(this.entry)
      }
      // console.log("EntryPreview.view_entry", this.uuid)
      this.goto(this.uuid, VIEW)
    },
    additional_action(action_name) {
      // console.log("additional_action", action_name)
      const preview_action = this.$_.find(this.additional_actions, a => a.name === action_name)
      // why?
      // if (this.template) {
      // const preview_action = this.$_.find(this.template.rules.preview_actions, a => a.name === action_key)
      console.log("res action", preview_action)
      // DUPLICATE BELOW

      const a_type = preview_action.type
      switch (a_type) {
        case "create_child":
          const action_aspect_loc = aspect_loc_str2arr(preview_action.aspect)
          const aspect_loc = loc_prepend(ENTRY, this.entry.uuid, action_aspect_loc)
          this.create_child(aspect_loc, this.entry.language, preview_action.child_type_slug)
          break
        case "download":
          this.download()
          break
        case "delete":
          this.$store.dispatch("entries/delete_entry", this.uuid)
          this.$emit("delete_e", this.uuid)
          this.persist_entries()
          break
        case "goto_loc":
          this.goto_next_entry_location()
          break
        default:
          console.log("unknown action", preview_action)
      }
    }
  }
}
</script>

<style scoped>

.custom-card {
  height: 100%
}

.entry-display-size {
  width: 100%;
}

.entry-image-size {
  max-height: 90px;
}
/*
@media (max-width: 959px) {
  .entry-meta {
    order: 1
  }


  .entry-image {
    order: -1;
    max-width: 100px;
  }

}
 */
</style>

