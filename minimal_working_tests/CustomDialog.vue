<template lang="pug">
  DialogWrapper(v-model="value" @close="close")
    div HELLLO
    v-btn(@click="close") close
</template>

<script>
import CustomizableDialogMixin from "~/minimal_working_tests/CustomizableDialogMixin"
import DialogWrapper from "~/minimal_working_tests/DialogWrapper"

export default {
  name: "CustomDialog",
  mixins: [CustomizableDialogMixin],
  components: {DialogWrapper},
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
