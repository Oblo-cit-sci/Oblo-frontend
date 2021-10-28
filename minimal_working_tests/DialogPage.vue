<template lang="pug">
  div
    CustomDialog(v-model="dialog_open" :persistent="false")
    v-btn(@click="open_dialog") open
</template>

<script>
import CustomDialog from "~/minimal_working_tests/CustomDialog"
export default {
  name: "DialogPage",
  mixins: [],
  components: {CustomDialog},
  props: {},
  data() {
    return {
      dialog_open: false
    }
  },
  computed: {},
  methods: {
    open_dialog() {
      this.dialog_open = true
    }
  }
}
</script>

<style scoped>

</style>
