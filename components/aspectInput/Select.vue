<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    SingleSelect(:options="options" v-bind:selection="selection" v-on:update:selection="cool($event)")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import SingleSelect from  "../SingleSelect"
  import Title_Description from "../Title_Description";
  import {get_codes_as_options} from "../../lib/client";

  export default {
    name: "Select",
    mixins: [AspectMixin],
    components: {Title_Description, SingleSelect},
    data() {
      return {
        selection: null
      }
    },
    created() {
      //console.log(this.aspect.items)
      this.selection = this.i_value
      this.options = get_codes_as_options(this.$store.state, this.aspect.items)
    },
    methods:{
      cool(event) {
        this.selection = event
        this.i_value = this.selection.key;
        this.value_change(this.i_value)
      }
    }
  }
</script>

<style scoped>

</style>
