<template lang="pug">
  v-layout(column justify-center align-center)
    v-flex(xs8 sm12 md12)
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
          header_type="h2"
          :description="page_info.description"
          mode="edit")
      br
      div(v-for="(aspect) in shown_aspects" :key="aspect.name")
        Aspect(
          :aspect="aspect"
          v-bind:value="entry.aspects_values[aspect.name]"
          v-on:update:value="update_value(aspect, $event)"
          v-on:entryAction="entryAction($event)"
          :id="aspect_id(aspect.name)"
          mode="edit"
          :extra="extras[aspect.name]"
          :extra_update="extras_update[aspect.name]")
      div(v-if="page === 0")
        License(:has_licence="has_license" :passedLicense.sync="entry.license" :mode="licence_mode")
        Privacy(:mode="privacy_mode" :passedPrivacy.sync="entry.privacy")
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
    pack_value, delete_entry, unpack, get_TitleAspect
  } from "../../lib/entry"
  import Title_Description from "../../components/Title_Description"
  import EntryActions from "../../components/EntryActions";
  import {
    EDIT,
    AUTOSAVE,
    CREATE_CONTEXT_ENTRY,
    GLOBAL_ASPECT_REF,
    TITLE_CHANGED,
    ASPECT, DELETE_CONTEXT_ENTRY, PUBLIC, PRIVATE_LOCAL, VIEW
  } from "../../lib/consts";
  import Aspect from "../../components/Aspect";

  import goTo from 'vuetify/lib/components/Vuetify/goTo'
  import {check_conditions, resolve_aspect_ref} from "../../lib/client";
  import EntryNavMixin from "../../components/EntryNavMixin";


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
        titleAspect: null,
        required_values: [], // shortcut, but in entry_type
        sending: false,
        complete: true,
        has_pages: false,
        page: 0,
        last_page: false,
        extras: {},
        extras_update: {},
      }
    },
    created() {
      this.uuid = this.$route.params.uuid
      const entry = this.$store.getters["entries/get_entry"](this.uuid)

      this.entry = JSON.parse(JSON.stringify(entry))

      this.$store.commit("set_global_ref", this.uuid)

      // set global ref, needed for deeply nested maps to know how to come back
      //this.$store.commit("set_global_ref", {uuid: this.uuid})

      this.entry_type = this.$store.getters.entry_type(this.entry.type_slug)
      this.titleAspect = get_TitleAspect(this.entry_type)
      this.has_pages = this.entry_type.content.meta.hasOwnProperty("pages")

      let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
      this.required_values = this.$_.map(required_aspects, (a) => {
        return a.name
      })

      this.conditions = check_conditions(this.entry_type)
      let condition_targets = this.$_.map(this.conditions, c => c.aspect)

      // todo same in page EntryType
      for (let aspect of this.entry_type.content.aspects) {
        let extra_props = {}
        extra_props.aspect_loc = [[ASPECT, aspect.name]]
        if (condition_targets.indexOf(aspect.name)) {
          extra_props.condition = {
            value: null
          }
        }
        this.extras[aspect.name] = extra_props
        this.extras_update[aspect.name] = false
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
            this.$store.commit("add_aspect_loc", value)
            break
          // todo maybe the server could set the titleAspect and itself
          // would in that case emit up this actiovaluen
          // otherwise, now its unused, cuz the titleAspect is grabbed here
          case TITLE_CHANGED:
            console.log("WARNING maybe out TITLE_CHANGED entry action", value)
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
      update_value(aspect, value) {
        if (aspect.name === this.titleAspect) {
          this.entry.title = unpack(value)
        }
        if (this.conditions.hasOwnProperty(aspect.name)) {
          console.log("condition triggered", aspect.name, value, ">", this.conditions[aspect.name])
          this.extras_update[this.conditions[aspect.name]] = !this.extras_update[this.conditions[aspect.name]]
          this.extras[this.conditions[aspect.name]].condition.value = unpack(value)
          console.log(this.extras_update[this.conditions[aspect.name]])
        }
        this.entry.aspects_values[aspect.name] = value
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
      },
      delete_child(ref) {
        delete_entry(this.$store, ref.uuid)
        delete this.entry.refs.children[ref.uuid]
        autosave(this.$store, this.entry)
      }
      // todo bring back
    /*check_conditions(event) {
        //console.log(this.extras)
        //console.log("UVALL", event, Object.keys(this.conditions).indexOf(event.aspect) > -1)
        if (Object.keys(this.conditions).indexOf(event.aspect) > -1) {
          console.log(this.conditions[event.aspect], this.conditions)
          const target = this.conditions[event.aspect]
          //this.extras[this.conditions[event.aspect]]["condition"] = {}
          //this.extras[this.conditions[event.aspect]]["condition"][event.aspect] = event.value
          this.condition_vals[target] = {val: event.value}
        }
      }*/
    },
    computed: {
      privacy_mode() {
        const privacy_set = this.entry_type.content.meta.privacy
        return privacy_set ? VIEW : EDIT

      },
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
      },
      licence_mode() {
        if(this.entry.refs.parent) {
          return VIEW
        }
      },
      parent_title() {
        // todo not necessarily available for remote entries. should be included?
        return this.$store.getters["entries/get_entry"](this.entry.refs.parent.uuid).title
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
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      page_info() {
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
    }
    ,
    watch: {
      page(val) {
        goTo("h1")
      }
    }
  }
</script>

<style scoped>

</style>
