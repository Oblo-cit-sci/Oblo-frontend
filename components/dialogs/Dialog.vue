<template lang="pug">
  v-dialog(:value="dialog_open" @click:outside="close" :width="width" :persistent="persistent" :style="{'overflow-x':'hidden'}")
    v-sheet.pa-2(:color="color")
      slot
</template>

<script>
import DialogMixin from "~/components/dialogs/DialogMixin";

export default {
  name: "Dialog",
  mixins: [DialogMixin],
  props: {
    persistent: Boolean,
    color: {
      type: String,
      default: "white"
    }
  }
}
</script>

<style scoped>

</style>
