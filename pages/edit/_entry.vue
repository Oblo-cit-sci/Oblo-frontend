<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entryType.title}}
      div {{entryType.description}}
      br
      div(v-for="(aspect, index) in entryType.content.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-bind:value.sync="aspects_values[aspect.name]"
          v-on:update-required="updateRequired")
      License(v-bind:selectedLicense.sync="license" :overwrite_default="draftLicense()")
      Privacy(v-bind:selectedPrivacy.sync="privacy" :overwrite_default="draftPrivacy()")
      v-btn(color="secondary" @click="save") save draft
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

  import {MAspectComponent, complete_activities} from "../../lib/client";

  export default {
    name: "EntryEdit",
    components: {Privacy, License, Basic, TextShort, TextLong, Location, ListOf, IntAspect},
    created() {

      let uuid =  this.$route.params.entry;
      this.entry = this.$store.state.fetched_entries[uuid];

      const index = this.$store.state.entry_type_slug_index_dict[this.entry.parent_type];
      this.entryType = this.$store.state.available_entries[index];

      for (let aspect of this.entryType.content.aspects) {
        this.aspects_values[aspect.name] = this.entry[aspect.name];
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
      save() { // draft
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
        this.$router.push("/");
      }
    }
  }
</script>

<style scoped>

</style>
