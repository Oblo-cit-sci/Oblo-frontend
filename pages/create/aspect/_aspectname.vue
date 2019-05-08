<template lang="pug">
  div

    component(v-bind:is="aspectComponent(aspect)"
      v-bind:aspect="aspect"
      v-bind:value.sync="aspects_value"
      v-on:update-required="updateRequired"
      v-on:create_related="create_related($event)")

    div(v-if="ref")
      v-btn(color="secondary" @click="save_back") save & back
</template>

<script>

  import Licci from "~~/components/aspectInput/special/Licci";

  import {MAspectComponent} from "../../../lib/client";
  import ReferenceMixin from "../../../components/ReferenceMixin";

  export default {
    name: "SingleAspectPage",
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
      let draft = this.$store.state.drafts[this.$route.query.ref_draft_id];
      this.aspect = JSON.parse(JSON.stringify(draft.entryType.content.aspects[this.$route.query.aspect_index]));
      if(this.aspect.attr.view !== "page") {
        console.log("HOW DID U GET HERE. PAGE VIEW FOR A NON PAGE ASPECT");
      }
      this.aspect.attr.view = "inline";
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect);
      },
      updateRequired() {
        // TODO
      },
      create_related() {
        // TODO
      }
    }
  }
</script>

<style scoped>

</style>
