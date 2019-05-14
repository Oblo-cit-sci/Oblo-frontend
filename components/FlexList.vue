<template lang="pug">
  div
  div(v-if="mode==='simple'")
    h3 {{aspect.name}}
    div {{aspect.description}}
    div(v-for="(value, index) in i_value" :key="index")
      component(v-bind:is="clearableAspectComponent(item_aspect)"
        v-bind:aspect="indexed_item_aspect(index)"
        v-bind:value.sync="value"
        v-on:update-required="updateRequired"
        icon="clear",
        :id="index",
        v-on:clear="remove_value(index)",
        v-on:create_related="create_related($event)")
    div
      div
        span(v-if="aspect.attr.min") min: {{aspect.attr.min}}, &nbsp;
        span(v-if="aspect.attr.max") max: {{aspect.attr.max}}
    v-btn(:disabled="!more_allowed" @click="add_value()" color="success") Add
      v-icon(right) add
</template>

<script>

    /*

      kindof the 3. generation of List after ListOf and List.
      the idea is to have 2 slots, for the view and input

     */

    export default {
        name: "FlexList"
    }
</script>

<style scoped>

</style>
