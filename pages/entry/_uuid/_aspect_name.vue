<template lang="pug">
  v-layout(column justify-center align-center)
    v-flex(xs8 sm12 md12)
      Title_Description(
        :title="aspect_title"
        header_type="h1"
        :description="aspect.description"
        mode="edit")
      div(v-if="entry.refs.parent")
        span This entry is part of the draft: &nbsp
        a(@click="to_parent") {{parent_title}}
    Aspect(
      :aspect="aspect"
      v-bind:value="aspects_value"
      v-on:update:value="update_value(aspect, $event)"
      v-on:entryAction="entryAction($event)"
      :id="aspect_id(aspect.name)"
      mode="edit"
      :extra="extras"
      :extra_update="extras_update")
</template>

<script>

  /* this is the page for Aspect-Pages */

  import Licci from "~~/components/aspectInput/special/Licci";

  import {MAspectComponent} from "~~/lib/entry";
  import Title_Description from "../../../components/Title_Description";

  export default {
    name: "AspectPage",
    components: {Title_Description, Licci},
    mixins: [],
    data() {
      return {
        uuid: null,
        aspect: null,
        aspect_value: null,
        extra: {},
        extra_update: false
      }
    },
    created() {
        this.uuid = this.$route.params.uuid
        let entry_type_slug = this.entry().type_slug
        let aspect_name = this.$route.params.aspect_name
        this.aspect = this.$store.getters.get_aspect(entry_type_slug, aspect_name)
      /*
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
      */

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
    },
    computed: {
      // TODO copy from other branch
      aspect_title() {
        return this.aspect.name
      },
      entry() {
        return this.$store.getters.get_entry(this.uuid)
      },
      aspect_id() {
        // todo cleaner?
        return this.aspect.name
        //return aspect_loc_str(this.extras[aspect_name].aspect_loc)
      }
    }
  }
</script>

<style scoped>
  .column {
    width: 70%;
  }
</style>
