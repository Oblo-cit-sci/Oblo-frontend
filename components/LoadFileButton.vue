<template lang="pug">
  div
    slot
      v-btn(:loading="loading" v-bind="btn_props")
        v-icon {{btn_icon}}
        span(v-if="label!==''") {{label}}
        input.input-file(type="file" @change="filesChange($event.target.files)" :accept="accepted")
</template>

<script>

  import FileLoadMixin from "./FileLoadMixin";


  export default {
    name: "LoadFileButton",
    mixins: [FileLoadMixin],
    props: {
      label: {
        type: String,
        default: "Add File"
      },
      btn_props: Object,
      btn_icon: {
          type:String,
          default: "mdi-import"
      },
    }
  }
</script>

<style scoped>
  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    position: absolute;
  }
</style>
