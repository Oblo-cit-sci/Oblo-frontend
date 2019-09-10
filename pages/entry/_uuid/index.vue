<template lang="pug">
  div
    v-layout(justify-center align-center)
      v-flex(xs12 md12)
        div(v-for="(aspect) in aspects" :key="aspect.name")
          Aspect(
            :aspect="aspect"
            :aspect_loc="aspect_locs[aspect.name]"
            mode="edit"
            :extra="extras[aspect.name]")
</template>

<script>
  import Aspect from "../../../components/Aspect";
  import {ASPECT, ENTRY} from "../../../lib/consts";

  /*
  :value="entry.aspects_values[aspect.name]"

            v-on:update:value="update_value(aspect, $event)"
          v-on:entryAction="entryAction($event)"
          :id="aspect_id(aspect.name)"
          mode="edit"
          :extra="extras[aspect.name]"
          :extra_update="extras_update[aspect.name]")
   */

  export default {
    name: "index",
    data() {
      return  {
        uuid: null,
        extras: {},
        aspect_locs: {}
      }
    },
    components: {Aspect},
    created() {
      this.uuid = this.$route.params.uuid
      for (let aspect of this.aspects) {
        //let extra_props = {}
        this.extras[aspect.name] = {}
        this.aspect_locs[aspect.name] = [[ENTRY, this.uuid],[ASPECT, aspect.name]]
      }

    },
    computed: {
      entry() {
        //console.log("compute e called")
        return this.$store.getters["entries/entry"](this.uuid)
      },
      aspects() {
        const entry_type = this.$store.getters.entry_type(this.entry.type_slug)
        return entry_type.content.aspects
      }
    },
    methods: {},
    watch: {}
  }
</script>

<style scoped>

</style>
