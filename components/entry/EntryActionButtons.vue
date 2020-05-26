<template lang="pug">


</template>

<script>
  import {VIEW} from "~/lib/consts"

  export default {
    name: "EntryActionButtons",
    mixins: [],
    components: {},
    props: {
      mode: {
        type: String,
        default: VIEW
      },
      additional_actions: {
        type: Object
      }
    },
    data() {
      return {}
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>

</style>
