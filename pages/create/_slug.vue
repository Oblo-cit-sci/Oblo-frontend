<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entryType.title}}
      div(v-if="ref")
        span This entry is part of the draft: &nbsp;&nbsp;
        a(@click="back_to_ref") {{ref.entryType}}

      div {{entryType.description}}
      br
      div(v-for="(aspect, index) in entryType.content.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-bind:value.sync="aspects_values[aspect.name]"
          v-on:update-required="updateRequired"
          v-on:create_related="create_related($event)")
      License(v-bind:selectedLicense.sync="license" :overwrite_default="draftLicense()")
      Privacy(v-bind:selectedPrivacy.sync="privacy" :overwrite_default="draftPrivacy()")
      v-btn(color="secondary" @click="save($event,'/')") save draft
      v-btn(v-bind:disabled="!complete" color="success" :loading="sending" @click="send") submit
</template>
<script>

  import Basic from "~~/components/aspectInput/Basic";
  import TextShort from "~~/components/aspectInput/TextShort";
  import IntAspect from "~~/components/aspectInput/IntAspect";
  import TextLong from "~~/components/aspectInput/TextLong";
  import Location from "~~/components/aspectInput/Location";
  import ListOf from "~~/components/aspectInput/ListOf";

  import License from "../../components/License";
  import Privacy from "../../components/Privacy";

  import {MAspectComponent, complete_activities, get_entrytpe} from "../../lib/client";

  export default {
    name: "slug",
    components: {Privacy, License, Basic, TextShort, TextLong, Location, ListOf, IntAspect},
    created() {
      console.log(this.$route);
      // check if the query has ref_draft_id or ref_uuid
      if(this.$route.query.hasOwnProperty("ref_draft_id")) {
        this.ref = {
          type: "draft",
          entryType: this.$store.state.drafts[this.$route.query.ref_draft_id].slug,
          draft_id: this.$route.query.ref_draft_id
        }
      } else if (this.$route.query.hasOwnProperty("ref_uuid")) {
        // TODO
      }
      this.slug = this.$route.params.slug;
      this.entryType = get_entrytpe(this.slug, this.$store);

      if (this.$route.query.hasOwnProperty("draft_id")) {
        this.draft_id = this.$route.query.draft_id;
        let draft = this.$store.state.drafts[this.draft_id];
        for (let aspect of this.entryType.content.aspects) {
          this.aspects_values[aspect.name] = draft.aspects_values[aspect.name];
        }
        this.license = draft.license;
      } else {
        for (let aspect of this.entryType.content.aspects) {
          this.aspects_values[aspect.name] = null;
        }
      }
    },
    beforeMount() {
      //console.log("before", this.draft_id);
    },
    data() {
      return {
        ref: null, // reference to a parent entry (draft or uuid) see "created"
        sending: false,
        aspects_values: {},
        license: null,
        privacy: null,
        required_values: {},
        complete: false
      }
    },
    methods: {
      // seems to be ok for now, but check again with non string aspects...
      updateRequired(aspect) {
        this.required_values[aspect.title] = aspect.value;
        for (let req_asp in this.required_values) {
          let val = this.required_values[req_asp];
          if (val === null || val === "") {
            this.complete = false;
            return;
          }
        }
        this.complete = true
      },
      draftLicense() {
        if (this.$route.query.hasOwnProperty("draft_id")) {
          return this.$store.state.drafts[this.draft_id].license;
        } else {
          return undefined;
        }
      },
      draftPrivacy() {
        if (this.$route.query.hasOwnProperty("draft_id")) {
          return this.$store.state.drafts[this.draft_id].privacy;
        } else {
          return undefined;
        }
      },
      aspectComponent(aspect) {
        return MAspectComponent(aspect);
      },
      send() {
        this.sending = true;

        const data = {
          entryType: this.slug,
          aspects: this.aspects_values,
          license_short: this.license.short,
          privacy: this.privacy.title,
          activities: complete_activities(this.entryType, "send", this.aspects_values)
        };

        this.$axios.post("/create_entry", data).then((res) => {
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
      save(event, goto) { // draft
        let create = false;
        if (!this.hasOwnProperty("draft_id")) {
          create = true;
          this.draft_id = this.$store.state.drafts.length;
        }
        let draft_data = {
          slug: this.slug,
          draft_id: this.draft_id,
          entryType: this.entryType,
          title: this.entryType.title + ": " + this.aspects_values.title,
          license: this.license,
          privacy: this.privacy,
          aspects_values: this.aspects_values
        };
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true});
        if (create) {
          this.$store.commit("create_draft", draft_data);
        } else {
          this.$store.commit("save_draft", draft_data);
        }
        if (goto !== undefined) {
          this.$router.push("/");
        }
        return draft_data.draft_id;
      },
      create_related(entry_type) {
        let draft_id = this.save();
        console.log("slug", entry_type, draft_id);
        this.$router.push({path: "/create/" + entry_type, query: {
          ref_draft_id: draft_id
        }});
      },
      back_to_ref() {
        console.log("back to ref");
        if(this.ref.type === "draft") {
          this.$router.push({path: "/create/" + this.ref.entryType, query: {draft_id: this.ref.draft_id}})
        }
      }
    }
  }
</script>

<style scoped>

</style>
