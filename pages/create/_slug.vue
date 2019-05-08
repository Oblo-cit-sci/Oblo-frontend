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
      div(v-if="!ref")
        License(v-bind:passedLicense.sync="license")
        Privacy(v-bind:selectedPrivacy.sync="privacy")
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
  import ListOf from "~~/components/aspectInput/ListOf";
  import AspectPageButton from "~~/components/aspectInput/AspectPageButton";

  import ReferenceMixin from "~~/components/ReferenceMixin";
  import License from "../../components/License";
  import Privacy from "../../components/Privacy";


  import {MAspectComponent, complete_activities} from "../../lib/client";

  export default {
    name: "slug",
    components: {Privacy, License, Basic, TextShort, TextLong, Location, ListOf, IntAspect, AspectPageButton},
    mixins: [ReferenceMixin], // in case of a context entry, to be able to get back to the parent
    created() {
      this.slug = this.$route.params.slug;

      this.entryType = this.$store.getters.entry_type(this.slug);
      let aspects = this.entryType.content.aspects;

      // DRAFT
      if (this.$route.query.hasOwnProperty("draft_id")) {
        this.draft_id = this.$route.query.draft_id;
        let draft = this.$store.state.edrafts.drafts[this.draft_id];
        for (let aspect of aspects) {
          this.aspects_values[aspect.name] = draft.aspects_values[aspect.name];
        }
        this.license = draft.license;
        this.privacy = draft.privacy;

      // NEW ENTRY
      } else {
        for (let aspect of aspects) {
          // todo make a better default based on the aspect type
          this.aspects_values[aspect.name] = null;
        }
        this.init_draft();
        for(let i in aspects) {
          // todo this happens already in MAspectComponent
          aspects[i].attr = aspects[i].attr || {};
          if((aspects[i].attr.view || "inline") === "page") {
            aspects[i].attr.draft_id = this.draft_id;
            aspects[i].attr.aspect_index = i;
          }
        }

        //this.license = "";draft.license;
        this.privacy = this.$store.state.user_data.defaultPrivacy;
      }
    },
    beforeMount() {
      //console.log("before", this.draft_id);
    },
    data() {
      return {
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
      create_draft_data() {
        let draft_title = this.entryType.title + ": ";
        if(this.aspects_values.title === "" || this.aspects_values.title === null){
          draft_title += this.draft_id;
        } else {
          draft_title += this.aspects_values.title;
        }

        return {
          slug: this.slug,
          draft_id: this.draft_id,
          entryType: this.entryType,
          title: draft_title,
          license: this.license,
          privacy: this.privacy,
          aspects_values: this.aspects_values
        };
      },
      init_draft() {
        console.log("INIT!!!");
        this.draft_id = this.$store.state.edrafts.next_id;
        // todo maybe some redundant data here...
        let draft_data = this.create_draft_data();
        this.$store.commit("edrafts/create_draft", draft_data);
        return this.draft_id;
      },
      autosave() {
        let draft_data = this.create_draft_data();
        this.$store.commit("edrafts/save_draft", draft_data);
        return draft_data.draft_id;
      },
      save(event, goto) { // draft
        this.autosave();
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true});
        if (goto !== undefined) {
          this.$router.push("/");
        }
      },
      create_related(entry_type, aspect) {
        // TODO rename
        let draft_id = this.save();
        //console.log("slug", entry_type, draft_id);
        this.$router.push({
          path: "/create/" + entry_type, query: {
            ref_draft_id: draft_id,
            aspect_index: aspect_index
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
