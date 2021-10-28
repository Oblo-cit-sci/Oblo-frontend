<template lang="pug">
  v-dialog(v-model="dialog_open"
    :width="width"
    @click:outside="click_outside"
    persistent)
    v-sheet(color="white")
      div.pl-2.pt-3(v-if="dialog_open && aspects" style="background:white")
        div.scroll
          AspectSet(:aspects="aspects" :mode="mode")
      div
        v-btn(@click="cancel()") Cancel
        v-btn(:disabled="error" @click="done()" color="success") Done
</template>

<script>
import {EDIT} from "~/lib/consts";
import DialogMixin from "~/components/dialogs/DialogMixin";
import AspectSet from "~/components/AspectSet";

/**
 * todo not used atm
 */
export default {
  name: "AspectSetDialog",
  mixins: [DialogMixin],
  components: {AspectSet},
  props: {
    aspects: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      default: EDIT
    },
    ext_value: {
      type: [Object, String, Number, Array, Boolean]
    },
  },
  methods: {
    // click_outside() {
    //   if (!this.done_button) {
    //     this.close()
    //   }
    // },
  }
}
</script>

<style scoped>
.scroll {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 800px
}
</style>
