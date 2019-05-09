<template lang="pug">
  div
    component(v-bind:is="aspectComponent(aspect)"
      v-bind:aspect="aspect"
      v-bind:value.sync="aspects_value"
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
        aspects_value: null
      }
    },
    created() {
      // todo what if no draft
      //let draft = this.$store.state.drafts[this.$route.query.ref_draft_id];
      let type_slug = this.$route.params.type_slug;
      let aspect_name = this.$route.params.aspect_name;
      this.aspect = this.$store.getters.get_aspect(type_slug, aspect_name);
      if (this.aspect.attr.view !== "page") {
        console.log("HOW DID U GET HERE. PAGE VIEW FOR A NON PAGE ASPECT");
      }
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect, true);
      },
      updateRequired() {
        // TODO
      },
      create_related() {
        // TODO
      },
      save_back() {

      }
    }
  }
</script>

<style scoped>

</style>
