<template lang="pug">
  div(v-for="(value, index) in i_value" :key="index")
    component(v-bind:is="clearableAspectComponent(item_aspect)"
      v-bind:aspect="indexed_item_aspect(index)"
      v-bind:value.sync="value"
      v-on:update-required="updateRequired"
      icon="clear",
      :id="index",
      v-on:clear="remove_value(index)",
      v-on:create_related="create_related($event)")

</template>

<script>
  import AspectMixin from "../aspectInput/AspectMixin";

  export default {
    name: "View_simple",
    mixins: [AspectMixin]
  }
</script>

<style scoped>

</style>
