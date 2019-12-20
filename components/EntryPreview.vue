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
          span Created from an outdated version. Some values might change. Download the entry if update does not work
      v-col(v-if="show_image" cols=12 class="col-md-2 col-sm-12 entry-image")
        div(class="float-md-right float-sm-left entry-display-size")
          v-avatar(
            v-if="entry.image"
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
          v-btn(small text outlined v-if="to_download" @click="download()") Download
          v-btn(small text outlined color="green"
            v-for="act in additional_actions"
            :key="act.key"
            @click="additional_action(act.key)") {{act.name}}
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
        ENTRYTYPES_TYPE,
        ENTRYTYPES_TYPENAME,
        SEARCH_ENTRY_ASPECT,
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
    import {upload} from "../lib/client";

    export default {
        name: "Entrypreview",
        components: {Aspect, EntryAspectView, MetaChips, Taglist},
        mixins: [EntryNavMixin, MapJumpMixin, EntryMixin, PersistentStorageMixin, ChildCreateMixin],
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
            actions: {
                type: Array,
                default: () => []
            }
            /*show_aspects_names: {
                    type: Array,
                    default: () => []
                }*/
        },
        methods: {
            goto() {
                const uuid = this.entry.uuid
                if (this.$store.getters[ENTRIES_HAS_ENTRY](uuid))
                    this.to_entry(uuid, this.proper_mode)
                else
                    this.fetch_and_nav(uuid)
            },
            privacy_icon(privacy) {
                return privacy_icon(privacy)
            },
            goto_location() {
                if (this.entry.location) {
                    this.$store.commit("map/goto_location", this.entry.location[0])
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
                //console.log("additional_action", this.entry_type)
                if (this.entry_type) {
                    const preview_action = this.entry_type.content.meta.preview_actions[action_key]
                    // DUPLICATE BELOW
                    if (preview_action.type === "create_child") {
                        const action_aspect_loc = aspect_loc_str2arr(preview_action.aspect)
                        const aspect_loc = loc_prepend(ENTRY, this.entry.uuid, action_aspect_loc)
                        this.create_child(aspect_loc, preview_action.child_type_slug)
                    } else if (preview_action.type === "download") {
                        this.download()
                    } else if (preview_action.type === "upload") {
                        /*
                        todo duplicate in the entryActions
                         */
                        const user_key = this.$store.getters.user_key
                        if (!user_key) {
                            this.error_snackbar("No user key. Go to the settings and paste the user key given by the LICCI core team")
                            return
                        }
                        const entries = this.$store.getters[ENTRIES_GET_RECURSIVE_ENTRIES](this.entry.uuid)
                        let export_data = {entries: entries, user_key: user_key}
                        upload(this.$axios, preview_action.url, export_data).then(res => {
                            this.snackbar(res.data.status, res.data.msg)
                        }).catch(err => {
                            console.log(err)
                            this.error_snackbar("Something went horribly wrong")
                        })
                    }
                }
            },
            aspect_locs(aspect) {
                //console.log([[ENTRY, this.entry.uuid], [ASPECT, aspect.name]])
                return [[ENTRY, this.entry.uuid], [ASPECT, aspect.name]]
            }
        },
        computed: {
            ...mapGetters({has_type: ENTRYTYPES_HAS_TYPE}),
            entry_date() {
                return printDate(this.entry.creation_datetime)
            },
            proper_mode() {
                return get_proper_mode(this.$store, this.entry)
            },
            to_download() {
                return this.outdated
            },
            goto_text() {
                // assuming, we call it edit and view
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
                return this.entry.image
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
                return static_file_path(this.$store, 'images/entry_images/' + this.entry.image)
            },
            tags() {
                return this.entry.tags || null
            },
            additional_actions() {
                const pw_actions = this.entry_type.content.meta.preview_actions
                const show_actions = []
                for (let pw_action_key in pw_actions) {
                    const pw_action = pw_actions[pw_action_key]
                    if (pw_action.type === "create_child") {
                        const action_aspect_loc = aspect_loc_str2arr(pw_action.aspect)
                        const aspect_loc = loc_prepend(ENTRY, this.entry.uuid, action_aspect_loc)
                        const value = this.$store.getters[ENTRIES_VALUE](aspect_loc).value
                        if (value.length > 0) {
                            show_actions.push(Object.assign(this.$_.clone(pw_action), {key: pw_action_key}))
                        }
                    } else if (pw_action.type === "download") {
                        show_actions.push(Object.assign(this.$_.clone(pw_action), {key: pw_action_key}))
                    } else if (pw_action.type === "upload") {
                        show_actions.push(Object.assign(this.$_.clone(pw_action), {key: pw_action_key}))
                    }
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

