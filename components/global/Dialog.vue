<template lang="pug">
  v-dialog(v-model="dialog_open" :width="width" :persistent="persistent")
    slot
      v-sheet
        div loading
</template>

<script>
import DialogMixin from "~/components/global/DialogMixin";

export default {
  name: "Dialog",
  mixins: [DialogMixin],
  props: {
    persistent: Boolean
  },
  data() {
    return {}
  },
  created() {
    console.log("dialog create")
  },
  methods: {
    close() {
      this.$emit('update:dialog_open', false)
    },
  }
}
</script>

<style scoped>

</style>
