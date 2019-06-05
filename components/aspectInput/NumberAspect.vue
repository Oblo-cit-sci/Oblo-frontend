<template lang="pug">
  div
    Title_Description(v-bind="title_description()")
    v-text-field(
      outline
      single-line
      v-model="i_value"
      hideDetails
      :suffix="suffix"
      :mask="mask" )
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";


  export default {
    name: "NumberAspect",
    components: {Title_Description},
    mixins: [AspectMixin],
    data() {
      return {
        mask: "",
        suffix: this.aspect.attr.suffix || "",
      }
    },
    created() {
      if(this.aspect.type === "int") {
        this.mask = "##########"
      } else {
        // todo. maybe use the type, prop but vuetify doesnt have any docs
        this.mask = undefined // "############.##########"
      }
    },
    watch: {
      i_value(val) {
        this.value_change(parseInt(val))
      }
    }
  }
</script>

<style scoped>

</style>
