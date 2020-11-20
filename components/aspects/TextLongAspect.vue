<template lang="pug">
  div(v-if="!is_view_mode")
    v-textarea(
      outlined
      single-line
      :readonly="is_view_mode"
      :disabled="disabled"
      auto-grow
      :counter="counter"
      :append-outer-icon="clearIcon"
      :hide_details="hide_details"
      @click:append-outer="$emit('aspectAction', {action: 'clear'})"

      :value="value"
      @input="update_value($event)"
      @update:error="$emit('update:error', $event)")
  div(v-else)
    p(class="body-1 readonly-aspect") {{value}}
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import TextfieldAspect from "../TextfieldAspect";


  export default {
    mixins: [AspectComponentMixin, TextfieldAspect],
    name: "TextLongAspect",
    data() {
      return {
        counter:false,
      }
    },
    created() {
      //console.log(this.aspect.attr.hasOwnProperty("max"));
      if(this.aspect.attr.hasOwnProperty("max")) {
        this.counter =  this.aspect.attr.max;
      }
    },
  }
</script>

<style scoped>

</style>
