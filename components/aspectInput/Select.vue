<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    SingleSelect(:options="options" v-bind:selection.sync="selection")
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
      this.selection = this.i_value
      this.options = get_codes_as_options(this.$store.state, this.aspect.items)
    },
    watch: {
      selection() {
        this.value_change(this.selection.key)
      }
    }
  }
</script>

<style scoped>

</style>
