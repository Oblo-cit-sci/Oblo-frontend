<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='' class="column")
      Title_Description(
        :title="entry_type.title"
        header_type="h1"
        :description="entry_type.description"
        mode="edit")
      div(v-if="entry.refs.parent")
        span This entry is part of the draft: &nbsp
        a(@click="to_parent") {{parent_title}}
      div(v-if="has_pages")
        Title_Description(
          :title="page_info.title"
          header_type="h3"
          :description="page_info.description"
          mode="edit")
      br
      div(v-for="(aspect) in shown_aspects" :key="aspect.name")
        Aspect(
          :aspect="aspect"
          v-bind:value.sync="entry.aspects_values[aspect.name]"
          v-on:entryAction="entryAction($event)"
          :id="aspect_id(aspect.name)"
          :condition="condition_vals[aspect.name]"
          mode="edit"
          :extra="extras[aspect.name]")
      div(v-if="!entry.ref && page === 0")
        License(v-bind:passedLicense.sync="entry.license" v-if="has_license")
        Privacy(v-bind:passedPrivacy.sync="entry.privacy" v-if="has_privacy")
      EntryActions(v-bind="entry_actions_props" :page.sync="page" :has_pages="has_pages")
</template>

<script>

  // v-on:create_ref="create_ref($event)"

  import License from "../../components/License"
  import Privacy from "../../components/Privacy"

  import {
    autosave,
    create_and_store,
    set_entry_value,
    aspect_loc_str,
    MAspectComponent,
    pack_value, delete_entry
  } from "../../lib/entry"
  import Title_Description from "../../components/Title_Description"
  import EntryActions from "../../components/EntryActions";
  import {
    CREATE,
    EDIT,
    AUTOSAVE,
    CREATE_CONTEXT_ENTRY,
    GLOBAL_ASPECT_REF,
    TITLE_CHANGED,
    ASPECT, DELETE_CONTEXT_ENTRY
  } from "../../lib/consts";
  import Aspect from "../../components/Aspect";

  import goTo from 'vuetify/lib/components/Vuetify/goTo'
  import {check_conditions, check_internallinks, resolve_aspect_ref} from "../../lib/client";
  import EntryNavMixin from "../../components/EntryNavMixin";

  const ld = require("lodash")

  export default {
    name: "uuid",
    mixins: [EntryNavMixin],
    components: {
      Aspect,
      EntryActions,
      Title_Description,
      Privacy, License
    },
    data() {
      return {
        entry: null,
        entry_type: null, // the full shizzle for the type_slug
        required_values: [], // shortcut, but in entry_type
        conditions: {}, // this contains  conditions between aspects (for now just conditions), key (sender), value: receiver
        sending: false,
        complete: true,
        has_pages: false,
        page: 0,
        last_page: false,
        extras: {},
      }
    },
    created() {
      this.uuid = this.$route.params.uuid
      this.entry = JSON.parse(JSON.stringify(this.$store.state.entries.entries.get(this.uuid)))
      // set global ref, needed for deeply nested maps to know how to come back
      this.$store.commit("set_global_ref", {uuid: this.uuid})

      this.entry_type = this.$store.getters.entry_type(this.entry.type_slug)

      this.has_pages = this.entry_type.content.meta.hasOwnProperty("pages")

      let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
      this.required_values = this.$_.map(required_aspects, (a) => {
        return a.name
      })

      this.conditions = check_conditions(this.entry_type)
      this.condition_vals = {}
      for (let target of Object.values(this.conditions)) {
        this.condition_vals[target] = {val: null}
      }
      //console.log("conditions", this.conditions, this.condition_vals)
      this.internal_links = check_internallinks(this.entry_type)

      // todo this whole part... not used atm...
      //console.log(this.entry_type.content)
      for (let aspect of this.entry_type.content.aspects) {
        //console.log("extra", aspect)
        //console.log(asecpt_descr.name, asecpt_descr.attr)
        let extra_props = {}
        /*
        if (aspect.attr.extra) {
          //console.log("extra for ", aspect.name)
          for (let e of aspect.attr.extra) {
            if (e === "ref") {
              extra_props[e] = { uuid: this.entry.uuid }
            }
          }
        }
        */
        extra_props.aspect_loc = [[ASPECT, aspect.name]]
        this.extras[aspect.name] = extra_props
      }
      /* set aspect refs:
          when an attribute has #
          this doesnt belong here, especially cuz of the duplicate for edit/_local_id page
      * */
      for (let aspect of this.entry_type.content.aspects) {
        let value = resolve_aspect_ref(this.$store, this.entry, aspect)
        if (value) {
          this.entry.aspects_values[aspect.name] = value
        }
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
    methods: {
      entryAction(event) {
        const action = event.action
        const value = event.value
        switch (action) {
          case AUTOSAVE:
            autosave(this.$store, this.entry)
            break
          case GLOBAL_ASPECT_REF:
            this.$store.commit("add_aspect_ref", value)
            break
          case TITLE_CHANGED:
            this.entry.title = value
            break
          case CREATE_CONTEXT_ENTRY:
            this.create_ref(value)
            break
          case DELETE_CONTEXT_ENTRY:
            this.delete_child(value)
            break
          default:
            console.log("unknown entry action", action, value)
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
      aspect_id(aspect_name) {
        return aspect_loc_str(this.extras[aspect_name].aspect_loc)
      },
      // should actually be the whole ref string
      // TODO goes out for Aspect component
      aspectComponent(aspect) {
        return MAspectComponent(aspect)
      },
      // TODO obviously this needs to be refatored
      // can be passed down to aspect. it only needs the entry_id passed down
      create_ref({type_slug, aspect_loc}) {
        let parent_ref_data = {
          uuid: this.uuid,
          aspect_loc: aspect_loc,
        }
        autosave(this.$store, this.entry)
        const entry = create_and_store(type_slug, this.$store, parent_ref_data)

        this.$store.commit("entries/add_ref_child",
          {
            uuid: this.uuid,
            child_uuid: entry.uuid,
            aspect_loc: aspect_loc
          }
        )
        // todo.1
        // here we must do something to avoid blinking cuz its inserterd before leaving
        // TODO: NO IDEA HOW IT SETS THE STORE
        set_entry_value(this.entry, aspect_loc, pack_value(entry.uuid))

        this.$router.push({
          path: "/entry/" + entry.uuid
        })
        // ********  ASPECT_PAGE
        // TODO
      },
      delete_child(ref) {
        delete_entry(this.$store, ref.uuid)
        delete this.entry.refs.children[ref.uuid]
        autosave(this.$store, this.entry)
      },
      // todo bring back
      check_conditions(event) {
        //console.log(this.extras)
        //console.log("UVALL", event, Object.keys(this.conditions).indexOf(event.aspect) > -1)
        if (Object.keys(this.conditions).indexOf(event.aspect) > -1) {
          console.log(this.conditions[event.aspect], this.conditions)
          const target = this.conditions[event.aspect]
          //this.extras[this.conditions[event.aspect]]["condition"] = {}
          //this.extras[this.conditions[event.aspect]]["condition"][event.aspect] = event.value
          this.condition_vals[target] = {val: event.value}
        }
      }
    },
    computed: {
      has_license() {
        const meta = this.entry_type.content.meta
        if (meta.hasOwnProperty("privacy")) {
          //console.log("private: no license")
          return meta.privacy !== "PRIVATE_LOCAL"
        } else if (meta.hasOwnProperty("has_license")) {
          //console.log("has licrense val", meta.has_license)
          return meta.has_license
        } else
          return true
      }
      ,
      parent_title() {
        return this.$store.getters["entries/get_entry"](this.entry.refs.parent.uuid).title
      }
      ,
      shown_aspects() {
        if (this.has_pages) {
          return ld.filter(this.entry_type.content.aspects, (a) => {
            /*console.log(a.name, a.attr.page, (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
              (this.page > 0 && a.attr.page === this.page))) */
            return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
              (this.page > 0 && a.attr.page === this.page))
          })
        }
        return this.entry_type.content.aspects
      }
      ,
      has_privacy() {
        const meta = this.entry_type.content.meta
        if (this.entry_type.content.meta.hasOwnProperty("privacy")) {
          return this.entry_type.content.meta.privacy !== "PRIVATE_LOCAL"
        } else if (meta.hasOwnProperty("has_privacy")) {
          return meta.has_privacy
        } else return true
      }
      ,
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      /*dl_url() {
        return "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify(this.aspects_values))
      }*/
      page_info() {
        return this.entry_type.content.meta.pages[this.page]
      }
      ,
      // wrong, create should be for all that are not local/saved or submitted
      mode() {
        return this.version === 0 ? CREATE : EDIT
      },
      entry_actions_props() {
        return {
          mode: this.mode,
          entry_type: this.entry_type,
          entry: this.entry
        }
      }
    }
    ,
    watch: {
      page(val) {
        console.log("page", val)
        goTo("h1")
      }
    }
  }
</script>

<style scoped>
  .column {
    width: 70%
  }
</style>
