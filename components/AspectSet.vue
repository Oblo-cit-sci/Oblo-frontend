<template lang="pug">
  div
    Aspect(v-for="a of aspects"
      :aspect="a"
      :key="a.name"
      :ext_value.sync="values[a.name]"
      @update:error="errors[a.name] = $event"
      :extra="{clearable:false}"
      mode="edit")
    div {{has_error}}
</template>

<script>
  import {aspect_default_value} from "~/lib/aspect"
  import Aspect from "~/components/Aspect"
  import {VIEW} from "~/lib/consts"

  export default {
    name: "AspectSet",
    mixins: [],
    components: {Aspect},
    props: {
      aspects: {
        type: Array
      },
      mode: {
        type: String,
        default: VIEW
      }
    },
    data() {
      const aspectMap = this.$_.keyBy(this.aspects, "name")
      return {
        values: this.$_.mapValues(aspectMap, a => aspect_default_value(a)),
        errors: this.$_.mapValues(aspectMap, a => null),
      }
    },
    computed: {
      has_error() {
        return this.$_.filter(this.errors, e => e).length > 0
      }
    },
    methods: {}
  }
</script>

<style scoped>

</style>
