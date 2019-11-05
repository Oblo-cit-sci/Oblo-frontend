<template lang="pug">
  v-row(justify-center align-center  v-if="!delete_entry && this.mode==='edit'")
    v-col(xs12 md12)
      Title_Description(
        :title="page_title"
        header_type="h1"
        :description="entry_type.description"
        mode="edit")
      div(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
      v-divider(class="wide_divider")
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h2"
          :description="page_info.description"
          mode="edit")
      br
      div(v-for="(aspect) in shown_aspects" :key="aspect.name")
        Aspect(
          :aspect="aspect"
          :aspect_loc="aspect_locs[aspect.name]"
          v-on:entryAction="entryAction($event)"
          :mode="mode")
      div(v-if="page === 0")
        v-divider(class="wide_divider")
        License(:passedLicense.sync="entry.license" :mode="licence_mode")
        Privacy(:mode="privacy_mode" :passedPrivacy.sync="entry.privacy")
      v-col(v-if="last_page")
        MissingAspectsNotice(:entry="this.entry")
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        v-on:entryAction="entryAction($event)"
        v-on:edit="mode='edit'")
      DecisionDialog(
        :open.sync="openSaveDialog"
        @action="edit_or_save_dialog($event)"
        v-bind="unsaved_changes_dialog")

  v-row(justify-center align-center v-else-if="this.mode==='view'")
    v-col(cols=12)
      Title_Description(
        :title="page_title"
        header_type="h1"
        :description="entry_type.description")
      div(v-if="has_parent")
        span This entry is part of:&nbsp
        a(@click="to_parent(true, mode)") {{parent_title}}
      div
        MetaChips(:meta_aspects="meta_aspects_privacy")
      v-divider(class="wide_divider")
    v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-9' : 'col-md-12']")
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h2"
          :description="page_info.description")
      br
      div(v-for="(aspect) in shown_aspects" :key="aspect.name")
        Aspect(
          :aspect="aspect"
          :aspect_loc="aspect_locs[aspect.name]"
          v-on:entryAction="entryAction($event)"
          :mode="mode")

    v-col(v-if="show_image" cols=12 class="col-md-3 col-sm-12 entry-image")
      v-img(:src="entry_image()" aspect-ratio=1)
    v-col(class="entry-meta" cols=12)
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        v-on:entryAction="entryAction($event)"
        v-on:edit="mode='edit'")
      DecisionDialog(
        :open.sync="openSaveDialog"
        @action="edit_or_save_dialog($event)"
        v-bind="unsaved_changes_dialog")
</template>

<script>

    import License from "../../../components/License"
    import Privacy from "../../../components/Privacy"

    import Title_Description from "../../../components/Title_Description"
    import EntryActions from "../../../components/EntryActions";
    import {
        EDIT,
        ASPECT, PRIVATE_LOCAL, VIEW
    } from "../../../lib/consts";
    import Aspect from "../../../components/Aspect";

    import goTo from 'vuetify/lib/services/goto'
    import EntryNavMixin from "../../../components/EntryNavMixin";
    import DecisionDialog from "../../../components/DecisionDialog";
    import {
        ENTRIES_GET_EDIT,
        ENTRIES_GET_PARENT,
        ENTRIES_SAVE_ENTRY,
        ENTRIES_SET_EDIT, ENTRIES_VALUE, ENTRIES_GET_ENTRY_TITLE
    } from "../../../lib/store_consts";
    import {get_aspect_vue_component} from "../../../lib/aspect"
    import {unsaved_changes_default_dialog} from "../../../lib/dialogs"
    import EntryMixin from "../../../components/EntryMixin";
    import MetaChips from "../../../components/MetaChips"
    import {privacy_icon, static_file_path} from "../../../lib/util"
    import MissingAspectsNotice from "../../../components/MissingAspectsNotice";

    /**
     * @vue-data {Object} entry_type - Initial counter's value
     */
    export default {
        name: "uuid",
        mixins: [EntryNavMixin, EntryMixin],
        components: {
            MissingAspectsNotice,
            DecisionDialog,
            Aspect,
            EntryActions,
            Title_Description,
            Privacy, License,
            MetaChips
        },
        data() {
            return {
                required_values: [], // shortcut, but in entry_type
                sending: false,
                complete: true,
                // todo abstact aspect-pagination
                page: this.$route.query.page | 0,
                uuid: null,  // todo , make computed
                aspect_locs: {},
                //
                openSaveDialog: false,
                unsaved_changes_dialog: unsaved_changes_default_dialog,
                router_next: null,
                // flag
                delete_entry: false
            }
        },
        created() {
            this.uuid = this.$route.params.uuid
            //console.log("entry index create", this.entry.aspects_values.)
            this.$store.dispatch(ENTRIES_SET_EDIT, this.uuid)

            let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
            this.required_values = this.$_.map(required_aspects, (a) => {
                return a.name
            })

            for (let aspect of this.entry_type.content.aspects) {
                this.aspect_locs[aspect.name] = [this.aspect_loc, [ASPECT, aspect.name]]
            }
        },
        mounted() {
            if (this.$route.query.goTo) {
                setTimeout(() => {
                    goTo("#" + this.$route.query.goTo, {
                        duration: 1200,
                        easing: "easeOutCubic"
                    })
                }, 300)
            }
        },
        beforeRouteLeave(to, from, next) {
            if (!this.delete_entry) {
                this.$store.dispatch(ENTRIES_SAVE_ENTRY)
            }
            this.$localForage.setItem("entries", this.$store.state.entries.entries, () => {
                console.log("stored")
            })
            next()
            /*
            if (this.entry.local.dirty) {
                this.openSaveDialog = true
                this.router_next = next
            } else {
                next()
            }*/
        },
        methods: {
            entry_image() {
                return static_file_path(this.$store, '/images/entry_images/' + this.entry.image)
            },
            edit_or_save_dialog(event) {
                if (event.confirm) {
                    this.$store.dispatch(ENTRIES_SAVE_ENTRY, this.uuid)
                    this.router_next()
                } else {
                    this.router_next = null
                }
            },
            check_complete() {
                for (let aspect_name of this.required_values) {
                    let val = this.entry.aspects_values[aspect_name]
                    //console.log("checking", aspect_name, val)
                    if (val === null || val === "") {
                        this.complete = false
                        console.log("fail")
                        return
                    }
                }
                this.complete = true
            },
            // todo maybe kickout, since its also in Aspect
            /*aspect_id(aspect_name) {
                console.log("ASP_LOC STR", aspect_loc_str(this.aspect_locs[aspect_name]))
                return aspect_loc_str(this.aspect_locs[aspect_name])
            },*/
            // should actually be the whole ref string
            // TODO goes out for Aspect component
            aspectComponent(aspect) {
                return get_aspect_vue_component(aspect)
            },
            entryAction(action) {
                if(action === "delete") {
                    this.delete_entry = true
                }
            }
        },
        computed: {
            mode: {
                get() {
                    return this.$route.query.mode || VIEW
                },
                set(mode) {
                    this.to_entry(this.uuid, mode)
                }
            },
            aspect_loc() {
                return [EDIT, this.uuid]
            },
            last_page() {
                return !this.has_pages || this.page === this.pages.length - 1
            },
            page_title() {
                return this.entry_type.title + (this.title ? ": " + this.title : "")
            },
            title() {
                return this.$store.getters[ENTRIES_GET_ENTRY_TITLE]()
            },
            aspects() {
                const entry_type = this.$store.getters.entry_type(this.entry.type_slug)
                return entry_type.content.aspects
            },
            entry() {
                return this.$store.getters[ENTRIES_GET_EDIT]
            },
            shown_aspects() {
                if (this.has_pages) {
                    return this.$_.filter(this.entry_type.content.aspects, (a) => {
                        return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
                            (this.page > 0 && a.attr.page === this.page))
                    })
                }
                return this.entry_type.content.aspects
            },
            privacy_mode() {
                const privacy_set = this.entry_type.content.meta.privacy
                return privacy_set ? VIEW : EDIT
            },
            licence_mode() {
                if (this.entry.refs.parent || this.entry.privacy === PRIVATE_LOCAL) {
                    return VIEW
                } else {
                    return EDIT
                }
            },
            dirty() {
                return this.entry.local.dirty || false
            },
            parent_title() {
                // todo not necessarily available for remote entries. should be included?
                //console.log(this.$store.getters[ENTRIES_GET_PARENT]())
                return this.$store.getters[ENTRIES_GET_PARENT]().title
            },
            // maybe also consider:
            // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
            page_info() {
                //console.log(this.entry_type, this.page, this.entry_type.content.meta.pages[this.page])
                if (this.has_pages)
                    return this.entry_type.content.meta.pages[this.page]
                else
                    return null
            },
            // wrong, create should be for all that are not local/saved or submitted
            entry_actions_props() {
                return {
                    mode: this.mode,
                    entry_type: this.entry_type,
                    entry: this.entry,
                }
            },
            meta_aspects_privacy() {
                let result = []
                result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
                result.push({name: "License: "+ this.entry.license})
                return result
            },
            show_image() {
              return this.entry.image
            }
        }, watch: {
            page() {
                setTimeout(() => goTo(".v-content"), {
                    duration: 200,
                    easing: "easeOutCubic"
                })
            }
        }
    }
</script>

<style scoped>
    .entry-image {
        max-width: 300px;
    }
    @media (max-width: 959px) {
        .entry-meta {
            order: 1
        }

        .entry-image {
            max-width: 300px;
        }
    }


</style>
