<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='' class="column")
      component(v-bind:is="aspectComponent(aspect)"
        v-bind:aspect="aspect"
        v-bind:value.sync="aspect_value"
        v-on:update-required="updateRequired"
        v-on:create_related="create_related($event)")
      div
        v-btn(color="secondary" @click="save_back") save & back
</template>

<script>

  /* this is the page for Aspect-Pages */

  import Licci from "~~/components/aspectInput/special/Licci";

  import {MAspectComponent} from "~~/lib/entry";

  export default {
    name: "AspectPage",
    components: {Licci},
    mixins: [],
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
      this.aspect = {... this.$store.getters.get_aspect(type_slug, this.aspect_name)}
      if (this.aspect.attr.view !== "page") {
        // not yet a complete disaster, it is maybe a list of composite
        if(this.aspect.type === "list" && this.aspect.items === "composite") {
          this.aspect.type = "composite"
        } else
          console.log("HOW DID U GET HERE. PAGE VIEW FOR A NON PAGE ASPECT");
      }
      console.log("final aspect", this.aspect)
      // todo, nope, entry_id, nope
      // todo.1
      //this.draft_id = this.$route.params.draft_id;
      //this.aspect_value = this.$store.state.edrafts.drafts[this.draft_id].aspects_values[this.aspect_name];
      console.log("creation done")

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
        // todo.1
        /*this.$store.commit("edrafts/set_draft_aspect_value" , {
          draft_id: this.draft_id,
          aspect_name: this.aspect_name,
          value: this.aspect_value
        });*/
        this.$router.push("/create/" + this.$route.params.type_slug + "/" + this.$route.params.entry_id)
      }
    }
  }
</script>

<style scoped>
  .column {
    width: 70%;
  }
</style>
