<template lang="pug">
  div
    v-text-field(v-model="path")
    div(v-if="eval") {{eval}}
</template>

<script>

const jp = require('jsonpath')
const {JSONPath} = require('jsonpath-plus');

export default {
  name: "AspectJSONPathChecker",
  props: {
    mvalue: {
      required: true
    }
  },
  data() {
    return {
      path: "",
      eval: null
    }
  },
  watch: {
    path(new_path) {
      if (["[","."].includes(new_path.substring(new_path.length - 1))) {
        return
      }
      try {
        // this.eval = jp.value(this.mvalue, new_path)
        this.eval = JSONPath({
          path:new_path,
          json: this.mvalue
        })
      } catch (e) {
        console.log("cannot parse", new_path)
        this.eval = ""
      }
    }
  }
}
</script>

<style scoped>

</style>
