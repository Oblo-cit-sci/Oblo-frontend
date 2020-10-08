<template lang="pug">
  v-dialog(v-model="dialog_open"
    :width="width"
    persistent)
    div.pl-2.pt-3(v-if="dialog_open && aspects" style="background:white")
      div.scroll
        AspectSet(:aspects="aspects" :mode="mode")
</template>

<script>
import {EDIT} from "~/lib/consts";
import DialogMixin from "~/components/global/DialogMixin";
import AspectSet from "~/components/AspectSet";

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
