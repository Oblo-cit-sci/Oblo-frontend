<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entry_type.title}}
      div {{entry_type.description}}
      div(v-if="has_pages")
        h3 {{page_info.title}}
        div {{page_info.description}}
      div(v-if="ref")
        span This entry is part of the draft: &nbsp;&nbsp;
        a(@click="back_to_ref") {{ref.parent_title}}
      br
      div(v-for="(aspect, index) in shown_aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-bind:value.sync="aspects_values[aspect.name]"
          v-on:update-required="updateRequired"
          v-on:create_related="create_related($event)")
      Paginate(v-if="has_pages" v-bind:page.sync="page"
        :total="entry_type.content.meta.pages.length"
        v-on:lastpage="last_page = $event")
      div(v-if="!ref")
        License(v-bind:passedLicense.sync="license" v-if="has_license")
        Privacy(v-bind:selectedPrivacy.sync="privacy" v-if="has_privacy")
        v-btn(@click="cancel_draft" color="error") cancel
        v-btn(color="secondary" @click="save($event,'/')") save draft
        v-btn(v-if="can_submit" v-bind:disabled="!complete" color="success" :loading="sending" @click="send") submit
        v-btn(:href="dl_url" :download="download_title" v-if="can_download" :disabled="!last_page" color="success" ) Download
      div(v-else)
        div License and Privacy are the same as the reference/parent entry
      div(v-if="ref")
        v-btn(color="secondary" @click="save_back") save & back
</template>

<script>

  // v-btn(v-if="can_download" color="warning") download
  import Basic from "~~/components/aspectInput/Basic";
  import TextShort from "~~/components/aspectInput/TextShort";
  import IntAspect from "~~/components/aspectInput/IntAspect";
  import TextLong from "~~/components/aspectInput/TextLong";
  import Location from "~~/components/aspectInput/Location";
  import CompositeAspect from "~~/components/aspectInput/CompositeAspect";
  import Select from "~~/components/aspectInput/Select";

  // TODO REFA
  // import ListOf from "~~/components/aspectInput/ListOf";

  import List from "~~/components/aspectInput/List";
  import AspectPageButton from "~~/components/aspectInput/AspectPageButton";

  import ReferenceMixin from "~~/components/ReferenceMixin";
  import License from "~~/components/License";
  import Privacy from "~~/components/Privacy";

  import {MAspectComponent, complete_activities} from "~~/lib/client";

  import Entry from "~~/lib/entry";
  import {create_and_store} from "../../../../lib/entry";
  import Paginate from "../../../../components/Paginate";

  const ld = require("lodash");

  export default {
    name: "entry_id",
    components: {
      Paginate, Privacy, License, Basic, TextShort, TextLong, Location,
      List, IntAspect, AspectPageButton, CompositeAspect, Select
    },
    mixins: [ReferenceMixin], // in case of a context entry, to be able to get back to the parent
    data() {
      return {
        // for the store
        type_slug: null, // immu
        entry_id: null, // draft_id or entry_uuid
        //title: null,
        license: null,  // just the short
        privacy: null, // string
        aspects_values: null,
        //
        entry_type: null, // the full shizzle for the type_slug
        sending: false,
        required_values: {},
        complete: false,
        has_pages: false,
        ref: null,

        page: 0,
        last_page: false
      }
    },
    created() {
      this.type_slug = this.$route.params.type_slug;
      this.entry_id = this.$route.params.entry_id; // draft_id or entry_uuid

      let draft_data = this.$store.state.edrafts.drafts[this.entry_id];

      this.license = draft_data.license;
      this.privacy = draft_data.privacy;
      this.aspects_values = JSON.parse(JSON.stringify(draft_data.aspects_values)); //{...draft_data.aspects_values};

      this.entry_type = this.$store.getters.entry_type(this.type_slug);

      this.has_pages = this.entry_type.content.meta.hasOwnProperty("pages");
    },
    methods: {
      updateRequired(aspect) {
        this.required_values[aspect.title] = aspect.value;
        for (let req_asp in this.required_values) {
          let val = this.required_values[req_asp];
          if (val === null || val === "") {
            this.complete = false;
            return;
          }
        }
        this.complete = true;
      },
      aspectComponent(aspect) {
        return MAspectComponent(aspect);
      },
      store_data() {
        return {
          type_slug: this.type_slug,
          draft_id: this.entry_id,
          entry_id: this.entry_id,
          title: Entry.draft_title(this.entry_type.title, this.aspects_values.title, this.entry_id),
          aspects_values: this.aspects_values,
          license: this.license,
          privacy: this.privacy,
          activities: complete_activities(this.entry_type, "send", this.aspects_values),
          ref: this.ref
        }
      },
      send() {
        this.sending = true;

        this.$axios.post("/create_entry", this.store_data()).then((res) => {
          this.sending = false;
          //console.log(res.data);
          this.$store.commit("set_snackbar", {message: res.data.msg, ok: res.data.status});

          if (this.hasOwnProperty("draft_id")) {
            this.$store.commit("remove_draft", this.draft_id);
          }
          this.$router.push("/");
        }).catch((err) => {
          console.log("error", err);
        })
      },
      autosave() {
        this.$store.commit("edrafts/save_draft", this.store_data());
      },
      cancel_draft() {
        // TODO maybe with confirmation
        this.$store.commit("edrafts/remove_draft", this.entry_id);
        this.$router.push("/");
      },
      save(event, goto) { // draft
        this.autosave();
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true});
        if (goto !== undefined) {
          this.$router.push("/");
        }
      },
      create_related(aspect) {
        this.autosave();
        /*
        page_aspect:
	      /create/<type_slug/<draft_id/<aspect_name

        context_entry:
	      /create/<type_slug/<draft_id?(ref:draft_id|entry_id)=...&aspect=

        */
        // this is a duplicate of MAspectComponent in client

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
              draft_id: this.entry_id,
              aspect_name: aspect.name,
            }
            if (is_list) {
              ref_data.index = this.aspects_values[aspect.name].length;
            }
            const new_draft_id = create_and_store(new_type_slug, this.$store);
            this.$store.commit("edrafts/add_reference", {
              draft_id: new_draft_id,
              ref: ref_data
            });
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
              path: "/create/" + this.type_slug + "/" + this.entry_id + "/" + aspect.name
            })
          } else {
            console.log("PROBLEM DERIVING REF TYPE FOR", aspect, "ACTUALLY THIS FUNCTION SHOULDNT BE CALLED")
          }
        }
      },
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
      can_submit() {
        if (this.entry_type.content.meta.hasOwnProperty("privacy")) {
          return this.entry_type.content.meta.privacy !== "PRIVATE_LOCAL"
        } else return true
      },
      can_download() {
        if (this.entry_type.content.meta.hasOwnProperty("privacy")) {
          return this.entry_type.content.meta.privacy === "PRIVATE_LOCAL"
        } else return false
      },
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      dl_url() {
        return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.aspects_values))
      },
      download_title() {
        return (this.aspects_values.title || "Survey " + this.entry_id).replace(" ", "_") + ".json"
      },
      page_info() {
        return this.entry_type.content.meta.pages[this.page]
      }
    }
  }
</script>

<style scoped>

</style>
