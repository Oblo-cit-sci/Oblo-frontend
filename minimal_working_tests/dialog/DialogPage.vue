<template lang="pug">
  div
    CustomDialog(v-model="dialog_open")
    v-btn(@click="dialog_open=true") open
    CustomDialog(v-model="persistent_dialog_open" persistent)
    v-btn(@click="persistent_dialog_open=true") open persistent
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
      dialog_open: false,
      persistent_dialog_open: false
    }
  },
  computed: {},
  methods: {
  }
}
</script>

<style scoped>

</style>
