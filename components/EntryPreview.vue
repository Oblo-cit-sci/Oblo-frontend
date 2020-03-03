<template lang="pug">
  v-card(class="mx-auto custom-card" outlined)
    v-row(class="ma-2")
      v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-8' : 'col-md-10']")
        div.caption(v-if="show_date") {{entry_date}}
        p.subtitle-1.mb-2 {{template_title}}:
          span.subtitle-1 &nbsp; {{entry.title}}
          v-btn(v-if="show_title_action" @click="goto()" depressed small)
            v-icon(:class="default_action_icon")
        MetaChips(v-if="show_meta_aspects" :meta_aspects="meta_aspects")
        EntryActorList.mt-2(:actors="actors")
        Taglist(v-if="show_tags" :tags="tags")
        .orange--text.mt-2(v-if="outdated")
          v-icon(color="orange") mdi-alert-outline
          span Created from an outdated version. Some values might change. Download the entry before updating is recommended
      v-col(v-if="show_image" cols=12 class="col-md-4 col-sm-12 entry-image")
        div(class="float-md-right float-sm-left entry-display-size")
          v-avatar(tile class="entry-image-size")
            v-img(
              contain
              :src="entry_image"
              height="400"
              alt="item")
    div.ml-4.mr-2
      Aspect(v-for="aspect in shown_aspects"
        :key="aspect.name"
        :aspect="aspect"
        mode="view"
        :aspect_loc="aspect_locs[aspect.name]")
    div(v-if="show_botton_actions")
      v-divider(light)
      v-card-actions
        div
          v-btn(v-if="has_type" small text outlined @click="goto(entry.uuid)") {{goto_text}}
          v-btn(small text outlined :color="act.color || 'green'"
            v-for="act in additional_actions"
            :key="act.name"
            :loading="action_loading[act.name] || false"
            @click="additional_action(act.name)") {{act.title}}
            v-icon(v-if="act.icon") {{act.icon}}
            V-badge(v-if="act.badge_content" color="black" :content="act.badge_content")
</template>

<script>

  import EntryNavMixin from "./EntryNavMixin";
  import {
    EDIT_UUID,
    ENTRIES_DOMAIN, ENTRIES_GET_RECURSIVE_ENTRIES,
    ENTRIES_SAVE_CHILD_N_REF,
    ENTRIES_VALUE,
    ENTRYTYPES_HAS_TYPE,
    ENTRYTYPES_TYPENAME,
    SEARCH_ENTRY_ASPECT
  } from "../lib/store_consts";
  import {privacy_icon, printDate} from "../lib/util"
  import {EDIT, ENTRY, VIEW} from "../lib/consts"
  import MetaChips from "../components/MetaChips"
  import Taglist from "../components/Taglist"
  import {create_entry, get_proper_mode} from "../lib/entry"
  import {CREATOR, entry_actor_relation} from "../lib/actors";
  import MapJumpMixin from "./MapJumpMixin";
  import EntryMixin from "./EntryMixin";
  import PersistentStorageMixin from "./PersistentStorageMixin";
  import ChildCreateMixin from "./ChildCreateMixin";
  import {aspect_loc_str2arr, loc_prepend} from "../lib/aspect";
  import Aspect from "./Aspect";
  import {mapGetters} from "vuex"
  import {upload_to_repo} from "../lib/import_export";
  import EntryActorList from "./entry/EntryActorList";
  import {check_str_is_uuid} from "../lib/fixes";

  /**
   * ISSUE is not working atm, to responsive
   */

  export default {
    name: "Entrypreview",
    components: {EntryActorList, Aspect, MetaChips, Taglist},
    mixins: [EntryNavMixin, MapJumpMixin, EntryMixin, MapJumpMixin,
      PersistentStorageMixin, ChildCreateMixin],
    data() {
      return {
        additional_action_loading: {}
      }
    },
    props: {
      show_date: {
        type: Boolean,
        default: true
      },
      show_meta_aspects: {
        type: Boolean,
        default: true
      },
      show_botton_actions: {
        type: Boolean,
        default: true
      },
      include_domain_tag: Boolean,
      show_title_action: Boolean,
      prevent_page_change: Boolean,
      actions: {
        type: Array,
        default: () => []
      },
    },
    computed: {
      ...mapGetters({has_type: ENTRYTYPES_HAS_TYPE}),
      action_loading() {
        return this.additional_action_loading
      },
      entry_date() {
        return printDate(new Date(this.entry.creation_ts))
      },
      proper_mode() {
        return get_proper_mode(this.entry, this.$store)
      },
      goto_text() {
        if (this.outdated)
          return "update"
        else
          return this.proper_mode
      },
      creator() {
        const public_name = this.entry.actors.creator.public_name
        //console.log(public_name)
        let relation = entry_actor_relation(this.entry, this.$store.getters.user)
        if (relation === CREATOR.key)
          return "From yourself"
        return public_name
      },
      show_image() {
        return this.entry.image // ![undefined, null, ""].includes(this.entry.image)
      },
      show_tags() {
        return this.entry.tags && Object.keys(this.entry.tags).length > 0
      },
      meta_aspects() {
        let result = []
        result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
        result.push({name: "License: " + this.entry.license})
        if (this.include_domain_tag) {
          result.push({name: this.$store.getters[ENTRIES_DOMAIN](this.entry.uuid)})
        }
        if (this.entry.status === "orphan") {
          result.push({name: "Orphan"})
        }
        return result
      },
      template_title() {
        return this.$store.getters[ENTRYTYPES_TYPENAME](this.entry.template.slug)
      },
      default_action_icon() {
        if (this.proper_mode === VIEW)
          return "fa fa-angle-right"
        else
          return "fa fa-edit"
      },
      entry_image() {
        if (this.entry.image !== null) {
          if (this.entry.image.startsWith("http")) {
            return this.entry.image
          } else if (check_str_is_uuid(this.entry.image)) {
            return this.$api.url_entry__$uuid__attachment__$file_uuid(this.uuid, this.entry.image)
          } else {
            return null
          }
        }
      },
      tags() {
        return this.entry.tags || []
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
          const action_name = pw_action.name
          if (pw_action.type === "create_child") {
            const action_aspect_loc = aspect_loc_str2arr(pw_action.aspect)
            const aspect_loc = loc_prepend(ENTRY, this.entry.uuid, action_aspect_loc)
            const value = this.$store.getters[ENTRIES_VALUE](aspect_loc)
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
          const search_res = this.$store.getters[SEARCH_ENTRY_ASPECT](this.entry.uuid)
          return this.$_.filter(this.template.aspects, a => search_res.includes(a.name))
        } else {
          return []
        }
      }
    },
    methods: {
      privacy_icon(privacy) {
        return privacy_icon(privacy)
      },
      goto_next_entry_location() {
        if (this.entry.location) {
          this.goto_next_location(this.entry.location)
        }
      },
      create_child_action() {
        if (this.disabled)
          return
        const index_aspect_loc = this.aspect_loc_for_index(this.value.length)
        //console.log("index_aspect_loc", index_aspect_loc)
        const child = create_entry(this.$store, this.item_type_slug, {}, {
          uuid: this.$store.getters[EDIT_UUID],
          aspect_loc: index_aspect_loc,
        })

        // saving the child, setting refrences, saving this entry(title),
        this.$store.dispatch(ENTRIES_SAVE_CHILD_N_REF, {child: child, aspect_loc: index_aspect_loc})
        // TODO this was there before, is it required???
        // this.value_change(this.$_.concat(this.value, [child.uuid]))
        this.persist_draft_numbers()
        this.persist_entries()
        this.to_entry(child.uuid, EDIT)
        this.goto_delayed_last_page()
      },
      additional_action(action_name) {
        console.log("additional_action", action_name)
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
            this.create_child(aspect_loc, preview_action.child_type_slug)
            break
          case "download":
            this.download()
            break
          case "upload":
            const entries = this.$store.getters[ENTRIES_GET_RECURSIVE_ENTRIES](this.entry.uuid)
            const upload_promise = upload_to_repo(this.$store, this.$axios, entries, preview_action.url, true)
            this.additional_action_loading[action_name] = true
            upload_promise.then(res => {
              this.snackbar(res.data.status, res.data.msg)
              this.additional_action_loading[action_name] = false
            }).catch(err => {
              console.log(err)
              this.additional_action_loading[action_name] = false
              this.error_snackbar(err)
            })
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
    width: 100% !important;
    height: auto !important;
    max-height: 200px;
  }

  @media (max-width: 959px) {
    /* adjust to your needs */
    .entry-meta {
      order: 1
    }

    .entry-image {
      order: -1;
      max-width: 200px;
    }
  }

</style>

