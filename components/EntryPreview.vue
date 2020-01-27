<template lang="pug">
  v-card(class="mx-auto custom-card" outlined)
    v-row(class="ma-2")
      v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-8' : 'col-md-10']")
        div.caption(v-if="show_date") {{entry_date}}
        p.subtitle-1.mb-2 {{typename}}:
          span.subtitle-1 &nbsp; {{entry.title}}
          v-btn(v-if="show_title_action" @click="goto()" depressed small)
            v-icon(:class="default_action_icon")
        MetaChips(v-if="show_meta_aspects" :meta_aspects="meta_aspects")
        Taglist(v-if="show_tags" :tags="tags")
        .orange--text.mt-2(v-if="outdated")
          v-icon(color="orange") mdi-alert-outline
          span Created from an outdated version. Some values might change. Download the entry before updating is recommended
      v-col(v-if="show_image" cols=12 class="col-md-2 col-sm-12 entry-image")
        div(class="float-md-right float-sm-left entry-display-size")
          v-avatar(
            tile
            class="entry-image-size")
            v-img(
              :src="entry_image"
              alt="item"
              contain)
    div.ml-4
      Aspect(v-for="aspect in shown_aspects"
        :key="aspect.name"
        :aspect="aspect"
        mode="view"
        :aspect_loc="aspect_locs(aspect)")
    div(v-if="show_botton_actions")
      v-divider(light)
      v-card-actions
        div
          v-btn(v-if="has_type" small text outlined @click="goto(entry)") {{goto_text}}
          v-btn(small text outlined @click="goto_location" v-if="has_action_goto_location")
            v-icon mdi-map-marker
            v-badge(color="black" :content="num_locations")
          v-btn(small text outlined :color="act.color || 'green'"
            v-for="act in additional_actions"
            :key="act.key"
            :loading="action_loading[act.key] || false"
            @click="additional_action(act.key)") {{act.name}} {{action_loading[act.key]}}

</template>

<script>

    import EntryNavMixin from "./EntryNavMixin";
    import {
        EDIT_UUID,
        ENTRIES_DOMAIN, ENTRIES_GET_RECURSIVE_ENTRIES,
        ENTRIES_HAS_ENTRY,
        ENTRIES_SAVE_CHILD_N_REF,
        ENTRIES_VALUE,
        ENTRYTYPES_HAS_TYPE,
        ENTRYTYPES_TYPENAME,
        SEARCH_ENTRY_ASPECT, INIT_PAGE_PATH, ENTRIES_GET_ENTRY, MAP_GOTO_LOCATION,
    } from "../lib/store_consts";
    import {privacy_icon, printDate, static_file_path} from "../lib/util"
    import {ASPECT, EDIT, ENTRY, VIEW} from "../lib/consts"
    import MetaChips from "../components/MetaChips"
    import Taglist from "../components/Taglist"
    import {create_entry, get_proper_mode} from "../lib/entry"
    import {CREATOR, entry_actor_relation} from "../lib/actors";
    import MapJumpMixin from "./MapJumpMixin";
    import EntryMixin from "./EntryMixin";
    import PersistentStorageMixin from "./PersistentStorageMixin";
    import ChildCreateMixin from "./ChildCreateMixin";
    import {aspect_loc_str2arr, loc_prepend} from "../lib/aspect";
    import EntryAspectView from "./EntryAspectView";
    import Aspect from "./Aspect";
    import {mapGetters} from "vuex"
    import {upload_to_repo} from "../lib/import_export";

    /**
     * ISSUE is not working atm, to responsive
     */

    export default {
        name: "Entrypreview",
        components: {Aspect, EntryAspectView, MetaChips, Taglist},
        mixins: [EntryNavMixin, MapJumpMixin, EntryMixin, PersistentStorageMixin, ChildCreateMixin],
        data() {
            return {
                additional_action_loading: {}
            }
        },
        props: {
            entry: {type: Object, required: true},
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
                return printDate(this.entry.creation_datetime)
            },
            proper_mode() {
                return get_proper_mode(this.$store, this.entry)
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
                return this.entry.tags && this.entry.tags.length > 0
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
            typename() {
                return this.$store.getters[ENTRYTYPES_TYPENAME](this.entry.type_slug)
            },
            default_action_icon() {
                if (this.proper_mode === VIEW)
                    return "fa fa-angle-right"
                else
                    return "fa fa-edit"
            },
            entry_image() {
                if(this.entry.image.startsWith("http")) {
                    return this.entry.image
                }
                return static_file_path(this.$store, 'images/entry_images/' + this.entry.image)
            },
            tags() {
                return this.entry.tags || null
            },
            additional_actions() {
                const pw_actions = this.$_.cloneDeep(this.entry_type.content.meta.preview_actions) || []
                console.log(this.entry_type.slug, pw_actions)
                const show_actions = []
                if (this.outdated) {
                    const download_action = this.$_.find(this.entry_type.content.meta.preview_actions, a => a.type === "download")
                    if (download_action)
                        download_action.color = "orange"
                    else
                        pw_actions.unshift({name: "Download", type: "download", color: "orange"})
                }
                for (let pw_action of pw_actions) {
                    const action_name = pw_action.name
                    if (pw_action.type === "create_child") {
                        const action_aspect_loc = aspect_loc_str2arr(pw_action.aspect)
                        const aspect_loc = loc_prepend(ENTRY, this.entry.uuid, action_aspect_loc)
                        const value = this.$store.getters[ENTRIES_VALUE](aspect_loc)
                        if (!value) {
                            console.log("child action cannot be added, aspect location doesnt exist for action:", pw_action.name)
                            continue
                        }
                        if (value.length > 0) {
                            show_actions.push(Object.assign(this.$_.clone(pw_action), {key: action_name}))
                        }
                    } else if (pw_action.type === "download") {
                        show_actions.push(Object.assign(this.$_.clone(pw_action), {key: action_name}))
                    } else if (pw_action.type === "upload") {
                        show_actions.push(Object.assign(this.$_.clone(pw_action), {key: action_name}))
                    }
                }
                for (let additional_action of this.actions) {
                    console.log("Aa", additional_action)
                    show_actions.push(additional_action)
                }
                return show_actions
            },
            shown_aspects() {
                //console.log(this.entry_type)
                if (this.entry_type) {
                    const search_res = this.$store.getters[SEARCH_ENTRY_ASPECT](this.entry.uuid)
                    return this.$_.filter(this.entry_type.content.aspects, a => search_res.includes(a.name))
                } else {
                    return []
                }
            }
        },
        methods: {
            goto() {
                if (!this.prevent_page_change) {
                    this.$store.commit(INIT_PAGE_PATH, this.$route)
                    // console.log("entrypreview goto", this.$route)
                    const uuid = this.uuid
                    if (this.$store.getters[ENTRIES_HAS_ENTRY](uuid))
                        this.to_entry(uuid)
                    else
                        this.fetch_and_nav(uuid)
                } else {
                    console.log(this.entry.uuid, this.goto_text)
                    this.$emit("preview_action", {uuid: this.entry.uuid, action: this.goto_text})
                }
            },
            privacy_icon(privacy) {
                return privacy_icon(privacy)
            },
            goto_location() {
                if (this.entry.location) {
                    this.$store.commit(MAP_GOTO_LOCATION, this.entry.location[0])
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
                this.value_change(this.$_.concat(this.value, [child.uuid]))
                this.persist_draft_numbers()
                this.persist_entries()
                this.to_entry(child.uuid, EDIT)
                this.goto_delayed_last_page()
            },
            additional_action(action_key) {
                console.log("additional_action", action_key)
                const preview_action = this.$_.find(this.additional_actions, a => a.key === action_key)
                // why?
                // if (this.entry_type) {
                // const preview_action = this.$_.find(this.entry_type.content.meta.preview_actions, a => a.name === action_key)
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
                        this.additional_action_loading[action_key] = true
                        upload_promise.then(res => {
                            this.snackbar(res.data.status, res.data.msg)
                            this.additional_action_loading[action_key] = false
                        }).catch(err => {
                            console.log(err)
                            this.additional_action_loading[action_key] = false
                            this.error_snackbar(err)
                        })
                        break
                    case "delete":
                        this.$store.dispatch("entries/delete_entry", this.uuid)
                        this.$emit("delete_e", this.uuid)
                        this.persist_entries()
                        break
                    default:
                        console.log("unknown action", preview_action)
                }
            },
            aspect_locs(aspect) {
                //console.log([[ENTRY, this.entry.uuid], [ASPECT, aspect.name]])
                return [[ENTRY, this.entry.uuid], [ASPECT, aspect.name]]
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

