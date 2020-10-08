<template lang="pug">
  v-dialog(v-model="dialog_open" :width="width")
    slot
      v-sheet(:width="width")
        div loading
</template>

<script>
import DialogMixin from "~/components/global/DialogMixin";

export default {
  name: "Dialog",
  mixins: [DialogMixin],
  data() {
    return {
      m: true
    }
  },
  created() {
    console.log("dialog create")
  }
}
</script>

<style scoped>

</style>
