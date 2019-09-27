<template lang="pug">
  v-layout(justify-center align-center)
    v-flex(xs12 md12)
      Title_Description(
        :title="entry_type.title"
        header_type="h1"
        :description="entry_type.description"
        mode="edit")
      div(v-if="entry.refs.parent")
        span This entry is part of:&nbsp
        a(@click="to_parent") {{parent_title}}
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
          mode="edit")
      div(v-if="page === 0")
        v-divider(class="wide_divider")
        License(:passedLicense.sync="entry.license" :mode="licence_mode")
        Privacy(:mode="privacy_mode" :passedPrivacy.sync="entry.privacy")
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        :has_pages="has_pages"
        v-on:entryAction="entryAction($event)")
      DecisionDialog(
        :open.sync="openSaveDialog"
        @action="edit_or_save_dialog($event)"
        id="unsaved_changes"
        title="Unsaved changes"
        text="You have unsaved changes"
        cancel_color="accent"
        cancel_text="Keep on editing"
        confirm_text="Save and move on")
      div(id="hidden_aspects_values") {{entry}}
</template>

<script>

    import License from "../../../components/License"
    import Privacy from "../../../components/Privacy"

    import {
        get_TitleAspect
    } from "../../../lib/entry"
    import Title_Description from "../../../components/Title_Description"
    import EntryActions from "../../../components/EntryActions";
    import {
        EDIT,
        ASPECT, PRIVATE_LOCAL, VIEW
    } from "../../../lib/consts";
    import Aspect from "../../../components/Aspect";

    import goTo from 'vuetify/lib/components/Vuetify/goTo'
    import EntryNavMixin from "../../../components/EntryNavMixin";
    import DecisionDialog from "../../../components/DecisionDialog";
    import {ENTRIES_GET_EDIT, ENTRIES_SAVE_ENTRY, ENTRIES_SET_EDIT} from "../../../lib/store_consts";
    import {get_aspect_component} from "../../../lib/aspect";


    export default {
        name: "uuid",
        mixins: [EntryNavMixin],
        components: {
            DecisionDialog,
            Aspect,
            EntryActions,
            Title_Description,
            Privacy, License
        },
        data() {
            return {
                entry_type: null, // the full shizzle for the type_slug
                titleAspect: null,
                required_values: [], // shortcut, but in entry_type
                sending: false,
                complete: true,
                has_pages: false,
                last_page: false,
                page: this.$route.query.page | 0,
                uuid: null,
                aspect_locs: {},
                //
                openSaveDialog: false,
                router_next: null
            }
        },
        created() {
            this.uuid = this.$route.params.uuid
            //console.log("entry index create", this.entry.aspects_values.)
            this.$store.commit("set_global_ref", this.uuid)
            this.$store.dispatch(ENTRIES_SET_EDIT, this.uuid)
            this.entry_type = this.$store.getters.entry_type(this.entry.type_slug)
            this.titleAspect = get_TitleAspect(this.entry_type)
            this.has_pages = this.entry_type.content.meta.hasOwnProperty("pages")

            let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
            this.required_values = this.$_.map(required_aspects, (a) => {
                return a.name
            })

            for (let aspect of this.entry_type.content.aspects) {
                this.aspect_locs[aspect.name] = [[EDIT, this.uuid], [ASPECT, aspect.name]]
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
          if(this.entry.local.dirty) {
              this.openSaveDialog = true
              this.router_next = next
          }  else {
              next()
          }
        },
        methods: {
            edit_or_save_dialog(event) {
                if (event.confirm) {
                    this.$store.dispatch(ENTRIES_SAVE_ENTRY, this.uuid)
                    this.router_next()
                } else {
                    this.router_next = null
                }
            },

            entryAction(event) {
                //console.log("entry action")
                const action = event.action
                const value = event.value
                switch (action) {
                  /*  case GLOBAL_ASPECT_REF:
                        this.$store.commit("add_aspect_loc", value)
                        break */
                    // todo maybe the server could set the titleAspect and itself
                    // would in that case emit up this actiovaluen
                    // otherwise, now its unused, cuz the titleAspect is grabbed here
                    /*case SAVE:
                        //this.dirty = false
                        save_entry(this.$store, this.entry)
                        break
                    */
                    /*case DELETE_CONTEXT_ENTRY:
                        this.delete_child(value)
                        break */
                    default:
                        console.log("unknown entry action", action, value, "event:", event)
                        break
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
                return get_aspect_component(aspect)
            },
        },
        computed: {
            aspects() {
                const entry_type = this.$store.getters.entry_type(this.entry.type_slug)
                return entry_type.content.aspects
            },
            entry() {
                //console.log("compute e called")
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
                return this.$store.getters["entries/get_entry"](this.entry.refs.parent.uuid).title
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
                    mode: EDIT,
                    entry_type: this.entry_type,
                    entry: this.entry
                }
            }
        }, watch: {
            page(val) {
                setTimeout(() => goTo(".v-content"), {
                    duration: 200,
                    easing: "easeOutCubic"
                })
            }
        }
    }
</script>

<style scoped>

  #hidden_aspects_values {
    /*display:none*/
  }
</style>
