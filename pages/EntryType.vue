<template lang="pug">
  div
    div(v-for="aspect in aspects" :key="aspect.name")
      Aspect(
        :aspect="aspect"
        v-bind:value="aspects_values[aspect.name]"
        v-on:update:value="update_value(aspect, $event)"
        v-on:entryAction="entryAction($event)"
        :id="aspect_id(aspect.name)"
        mode="edit"
        :extra="extras[aspect.name]"
        :extra_update="extras_update[aspect.name]")
</template>

<script>
    export default {
        name: "EntryType",
        mixins: [],
        data() {
          return {
            aspects: [],
            aspects_values: {},
            extras: {},
            extras_update: {}
          }
        },
        methods: {
          update_value(aspect, event) {

          },
          entryAction(event) {

          },
          aspect_id(name) {
            return ""
          }
        }
    }
</script>

<style scoped>

</style>
