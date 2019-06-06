<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='' class="column")
      Title_Description(:title="entry_type.title" header_type="h1" :description="entry_type.description")
      div(v-if="entry.ref")
        span This entry is part of the draft: &nbsp
        a(@click="back_to_ref") {{entry.ref.parent_title}}
      div(v-if="has_pages")
        Title_Description(:title="page_info.title" header_type="h3" :description="page_info.description")
      br
      div(v-for="(aspect) in shown_aspects" :key="aspect.name")
        Aspect(:aspect="aspect" v-bind:value.sync="entry.aspects_values[aspect.name]" :edit="true" v-on:create_ref="create_ref($event)")
      div(v-if="!entry.ref && page === 0")
        License(v-bind:passedLicense.sync="entry.license" v-if="has_license")
        Privacy(v-bind:passedPrivacy.sync="entry.privacy" v-if="has_privacy")
      EntryActions(v-bind="entry_actions_props" :page.sync="page")
</template>

<script>

/*
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-bind:value.sync="entry.aspects_values[aspect.name]"
          v-on:create_related="create_related($event)")

 */

  import Location from "~~/components/aspectInput/Location"
  import CompositeAspect from "~~/components/aspectInput/CompositeAspect"
  import Select from "~~/components/aspectInput/Select"

  import List from "~~/components/aspectInput/List"
  import Map from "~~/components/aspectInput/Map"

  import AspectPageButton from "~~/components/aspectInput/AspectPageButton"

  import ReferenceMixin from "~~/components/ReferenceMixin"
  import License from "~~/components/License"
  import Privacy from "~~/components/Privacy"

  import {MAspectComponent} from "~~/lib/entry"

  import {autosave, create_and_store} from "../../../../lib/entry"
  import Paginate from "../../../../components/Paginate"
  import Title_Description from "../../../../components/Title_Description"
  import EntryActions from "../../../../components/EntryActions";
  import {CREATE, EDIT} from "../../../../lib/consts";
  import Aspect from "../../../../components/Aspect";

  const ld = require("lodash")

  export default {
    name: "draft_id",
    components: {
      Aspect,
      EntryActions,
      Title_Description,
      Paginate, Privacy, License, Location,
      List, AspectPageButton, CompositeAspect, Select, Map
    },
    mixins: [ReferenceMixin], // in case of a context entry, to be able to get back to the parent
    data() {
      return {
        // from the store should include
        // type_slug, draft_id, entry_id, license, privacy, version, status, aspects_values, ref
        entry: null,

        entry_type: null, // the full shizzle for the type_slug
        required_values: [], // shortcut, but in entry_type

        complete: true,

        has_pages: false,
        page: 0,
        last_page: false
      }
    },
    created() {
      this.type_slug = this.$route.params.type_slug
      // TODO carefull refactor later
      this.draft_id = this.$route.params.draft_id // draft_id or entry_uuid

      this.entry = JSON.parse(JSON.stringify(this.$store.state.edrafts.drafts[this.draft_id]))

      //console.log(this.type_slug)
      this.entry_type = this.$store.getters.entry_type(this.type_slug)
      //console.log(this.entry_type)
      this.has_pages = this.entry_type.content.meta.hasOwnProperty("pages")

      let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
      this.required_values = this.$_.map(required_aspects, (a) => {
        return a.name
      })

      if (this.entry.ref) {
        // TODO maybe simply copy?!
        let ref = this.entry.ref
        let parent = {}
        if (ref.hasOwnProperty("draft_id")) {
          parent = this.$store.state.edrafts.drafts[ref.draft_id];
          ref.type = "draft"
        } else if (this.entry.ref.hasOwnProperty("entry_id")) {
          ref.type = "entry"
          // todo...
        }

        ref.type_slug = parent.type_slug
        ref.parent_title = parent.title
      }

      // this.check_complete() // TODO bring back watcher, isnt triggered tho...
      //console.log(this.has_pages)
    },
    methods: {
      // TODO Depracated
      updateRequired(aspect) {
        this.required_values[aspect.title] = aspect.value
        for (let req_asp in this.required_values) {
          let val = this.required_values[req_asp]
          if (val === null || val === "") {
            this.complete = false
            return
          }
        }
        this.complete = true
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
      // TODO goes out for Aspect component
      aspectComponent(aspect) {
        return MAspectComponent(aspect)
      },
      back_to_ref() {
        if (this.entry.ref.type === "draft") {
          this.$router.push("/create/" + this.entry.ref.type_slug + "/" + this.entry.ref.draft_id)
        }
      },
      // TODO obviously this needs to be refatored
      // can be passed down to aspect. it only needs the entry_id passed down
      create_ref(aspect) {
        autosave(this.$store, this.entry)
        /*
        page_aspect:
	      /create/<type_slug/<draft_id/<aspect_name

        context_entry:
	      /create/<type_slug/<draft_id?(ref:draft_id|entry_id)=...&aspect=

        // this is a duplicate of MAspectComponent in client,,,
        // TODO : CHECK AND REDO THAT PART

        /*
          finding ref-type descriptor:
            --- aspect_page or context_entry ---
            AP: attr.view === page
            List<AP>: items.attr.view === page
            CE: type[0] = $
            List<CE>: items.type[0] = $
        */

        let aspect_to_check = aspect
        const is_list = aspect.type === "list"
        if (is_list) {
          aspect_to_check = aspect.items
        }

        if (typeof (aspect_to_check) === "string") {
          // ******** CONTEXT_ENTRY
          if (aspect_to_check[0] === "$") {
            const new_type_slug = aspect_to_check.substring(1)
            let ref_data = {
              draft_id: this.draft_id,
              aspect_name: aspect.name,
              //type_slug: this.entry.type_slug
            }
            if (is_list) {
              ref_data.index = this.entry.aspects_values[aspect.name].length
            }
            const new_draft_id = create_and_store(new_type_slug, this.$store)
            this.$store.commit("edrafts/add_reference", {
              draft_id: new_draft_id,
              ref: ref_data
            })
            this.$router.push({
              path: "/create/" + new_type_slug + "/" + new_draft_id
            })
          } else {
            console.log("PROBLEM DERIVING REF TYPE FOR", aspect)
          }
        } else {
          // ********  ASPECT_PAGE
          if (aspect_to_check.attr.view === "page") {
            this.$router.push({
              // TODO this wont run...
              path: "/create/" + this.entry.type_slug + "/" + this.entry.entry_id + "/" + aspect.name
            })
          } else {
            console.log("PROBLEM DERIVING REF TYPE FOR", aspect, "ACTUALLY THIS FUNCTION SHOULDNT BE CALLED")
          }
        }
      }
    },
    computed: {
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
      },
      has_license() {
        if (this.entry_type.content.meta.hasOwnProperty("privacy")) {
          return this.entry_type.content.meta.privacy !== "PRIVATE_LOCAL"
        } else return true
      },
      has_privacy() {
        if (this.entry_type.content.meta.hasOwnProperty("privacy")) {
          return this.entry_type.content.meta.privacy !== "PRIVATE_LOCAL"
        } else return true
      },
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      /*dl_url() {
        return "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify(this.aspects_values))
      }*/
      page_info() {
        return this.entry_type.content.meta.pages[this.page]
      },
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
    },
    watch: {
      aspects_values(new_values) {
        //console.log("update values")
        this.check_complete()
      }
    }
  }
</script>

<style scoped>
  .column {
    width: 70%
  }
</style>
