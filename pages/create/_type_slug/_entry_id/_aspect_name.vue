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
      //let draft = this.$store.state.drafts[this.$route.query.ref_draft_id];
      let type_slug = this.$route.params.type_slug;
      this.aspect_name = this.$route.params.aspect_name;
      this.aspect = this.$store.getters.get_aspect(type_slug, this.aspect_name);
      if (this.aspect.attr.view !== "page") {
        console.log("HOW DID U GET HERE. PAGE VIEW FOR A NON PAGE ASPECT");
      }
      this.aspect_value = {};
    },
    methods: {
      aspectComponent(aspect) {
        let at = MAspectComponent(aspect, true);
        console.log(at);
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
          draft_id: this.$route.params.entry_id,
          aspect_name: this.aspect_name,
          value: this.aspect_value
        });
      }
    }
  }
</script>

<style scoped>

</style>
