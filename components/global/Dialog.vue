<template lang="pug">
  v-dialog(v-model="dialog_open" :width="width" :persistent="persistent" :style="{'overflow-x':'hidden'}")
    slot
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
  }
}
</script>

<style scoped>

</style>
