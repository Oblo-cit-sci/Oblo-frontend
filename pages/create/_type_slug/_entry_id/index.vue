<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entry_type.title}}
      div {{entry_type.description}}
      div(v-if="ref")
        span This entry is part of the draft: &nbsp;&nbsp;
        a(@click="back_to_ref") {{ref.parent_title}}

      br
      div(v-for="(aspect, index) in entry_type.content.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-bind:value.sync="aspects_values[aspect.name]"
          v-on:update-required="updateRequired"
          v-on:create_related="create_related($event)")
      div(v-if="!ref")
        License(v-bind:passedLicense.sync="license")
        Privacy(v-bind:selectedPrivacy.sync="privacy")
        v-btn(@click="cancel_draft" color="error") cancel
        v-btn(color="secondary" @click="save($event,'/')") save draft
        v-btn(v-bind:disabled="!complete" color="success" :loading="sending" @click="send") submit
      div(v-else)
        div License and Privacy are the same as the reference/parent entry
      div(v-if="ref")
        v-btn(color="secondary" @click="save_back") save & back
</template>

<script>

  import Basic from "~~/components/aspectInput/Basic";
  import TextShort from "~~/components/aspectInput/TextShort";
  import IntAspect from "~~/components/aspectInput/IntAspect";
  import TextLong from "~~/components/aspectInput/TextLong";
  import Location from "~~/components/aspectInput/Location";
  import CompositeAspect from "~~/components/aspectInput/CompositeAspect";

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

  const ld = require("lodash");

  export default {
    name: "entry_id",
    components: {
      Privacy, License, Basic, TextShort, TextLong, Location,
      List, IntAspect, AspectPageButton, CompositeAspect
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
        complete: false
      }
    },
    created() {
      this.type_slug = this.$route.params.type_slug;
      this.entry_id = this.$route.params.entry_id; // draft_id or entry_uuid

      let draft_data = this.$store.state.edrafts.drafts[this.entry_id];

      this.license = draft_data.license;
      this.privacy = draft_data.privacy;
      this.aspects_values =  JSON.parse(JSON.stringify(draft_data.aspects_values)); //{...draft_data.aspects_values};

      this.entry_type = this.$store.getters.entry_type(this.type_slug);
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
          activities: complete_activities(this.entry_type, "send", this.aspects_values)
        }
      },
      send() {
        this.sending = true;

        this.$axios.post("/create_entry", this.store_data()).then((res) => {
          this.sending = false;
          console.log(res.data);
          this.$store.commit("set_snackbar", {message: res.data.msg, ok: res.data.status});

          if (this.hasOwnProperty("draft_id")) {
            this.$store.commit("remove_draft", this.draft_id);
          }
          this.$router.push("/");
        }).catch((err) => {
          console.log("error");
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
        console.log(aspect);

        // TODO maybe move somewhere else...
        // this
        /*

        page_aspect:
	      /create/<type_slug/<draft_id/<aspect_name

        context_entry:
	      /create/<type_slug/<draft_id?(ref:draft_id|entry_id)=...&aspect=

        */
        // this is a duplicate of MAspectComponent in client
        // TODO TEST with something
        if((aspect.attr.view || "inline") === "page") {
          // would only need a ref url-param if its in a list/map
          this.$router.push({path: "/create/" + this.type_slug + "/"+ this.draft_id + "/" + aspect.name});
        }
        else if(aspect) {
          // TODO fck typechar stuff is everywhere:
          const is_list = aspect.type === "list";
          let new_type_slug = "";

          let ref = {
            draft_id : this.entry_id, // TODO dangerous temp solution...
            aspect_name: aspect.name,
          };
          if(is_list) {
            new_type_slug = aspect.items.substring(1);
          } else {
            new_type_slug = aspect.type.substring(1);
          }
          console.log("TO TYPE", new_type_slug);
          // TODO should be draft_id or entry_id
          // but its still a bit messed up. it has entry_id, tho its a draft

          if(is_list) {
            ref.index = this.aspects_values[aspect.name].length;
          }

          const new_draft_id = create_and_store(new_type_slug, this.$store);
          console.log("created with draft_id", new_draft_id);
          this.$router.push({
            path: "/create/" + new_type_slug + "/"+ new_draft_id,
            query: {
              draft_id : ref.draft_id,
              aspect_name: ref.aspect_name,
              index: ref.index
            }});
        }
      }
    }
  }
</script>

<style scoped>

</style>
