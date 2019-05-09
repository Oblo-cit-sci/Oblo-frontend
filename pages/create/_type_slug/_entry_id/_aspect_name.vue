<template lang="pug">
  div
    component(v-bind:is="aspectComponent(aspect)"
      v-bind:aspect="aspect"
      v-bind:value.sync="aspect_value"
      v-on:update-required="updateRequired"
      v-on:create_related="create_related($event)")
    div
      v-btn(color="secondary" @click="save_back") save & back
</template>

<script>

  import Licci from "~~/components/aspectInput/special/Licci";

  import {MAspectComponent} from "~~/lib/client";
  import ReferenceMixin from "~~/components/ReferenceMixin";


  export default {
    name: "AspectPage",
    components: {Licci},
    mixins: [ReferenceMixin],
    data() {
      return {
        aspect: null,
        aspect_value: null
      }
    },
    created() {
      // todo what if no draft
      let type_slug = this.$route.params.type_slug;
      this.aspect_name = this.$route.params.aspect_name;
      this.aspect = this.$store.getters.get_aspect(type_slug, this.aspect_name);
      if (this.aspect.attr.view !== "page") {
        console.log("HOW DID U GET HERE. PAGE VIEW FOR A NON PAGE ASPECT");
      }

      this.draft_id = this.$route.params.entry_id;
      this.aspect_value = this.$store.state.edrafts.drafts[this.draft_id].aspects_values[this.aspect_name];
    },
    methods: {
      aspectComponent(aspect) {
        let at = MAspectComponent(aspect, true);
        return at;
      },
      updateRequired() {
        // TODO
      },
      create_related() {
        // TODO
      },
      save_back() {
        this.$store.commit("edrafts/set_draft_aspect_value" , {
          draft_id: this.draft_id,
          aspect_name: this.aspect_name,
          value: this.aspect_value
        });
        this.$router.push("/create/" + this.$route.params.type_slug + "/" + this.$route.params.entry_id)
      }
    }
  }
</script>

<style scoped>

</style>
