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
        v-bind:value="aspect_value"
        v-on:update:value="update_value(aspect, $event)"
        v-on:entryAction="entryAction($event)"
        :id="aspect_id"
        mode="edit"
        :extra="extra"
        :extra_update="extra_update")
</template>

<script>

  /* this is the page for Aspect-Pages */

  import Licci from "~~/components/aspectInput/special/Licci";

  import {MAspectComponent} from "~~/lib/entry";
  import Title_Description from "../../../components/Title_Description";
  import Aspect from "../../../components/Aspect";
  import {ASPECT} from "../../../lib/consts";
  import {aspect_loc_str} from "../../../lib/entry";

  export default {
    name: "AspectPage",
    components: {Aspect, Title_Description, Licci},
    mixins: [],
    data() {
      return {
        uuid: null,
        aspect: null,
        aspect_value: null,
        extra: {
          ignore_pageAspect:true,
          aspect_loc: [ASPECT, this.$route.params.aspect_name],
          show_title_descr: false
        },
        extra_update: false
      }
    },
    created() {
      this.uuid = this.$route.params.uuid
      let entry_type_slug = this.entry.type_slug
      let aspect_name = this.$route.params.aspect_name
      this.aspect = this.$store.getters.get_aspect(entry_type_slug, aspect_name)
      this.aspect_value = this.entry.aspects_values[aspect_name]
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect, true);
      },
      save_back() {

        this.$router.push("/create/" + this.$route.params.type_slug + "/" + this.$route.params.entry_id)
      }
    },
    computed: {
      // TODO copy from other branch
      aspect_title() {
        return this.aspect.name
      },
      entry() {
        return this.$store.getters["entries/get_entry"](this.uuid)
      },
      aspect_id() {
        return aspect_loc_str(this.extra.aspect_loc)
      }
    }
  }
</script>

<style scoped>
  .column {
    width: 70%;
  }
</style>
