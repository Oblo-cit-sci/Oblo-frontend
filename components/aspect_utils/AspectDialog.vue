<template lang="pug">
  v-dialog(v-model="dialog_open"
    :width="main_container_with"
    persistent)
    div(v-if="dialog_open && aspect").pl-2.pt-3(style="background:white")
      div
        Aspect(v-if="show_aspect"
          :aspect="aspect"
          :mode="mode"
          :ext_value="ext_value"
          @update:ext_value="update_value($event)")
      div
        v-btn(v-if="done_button" @click="done()") Done
</template>

<script>
  import LayoutMixin from "~/components/global/LayoutMixin"
  import {DATE, LOCATION, SELECT} from "~/lib/consts"
  import Aspect from "~/components/Aspect"

  export default {
    name: "AspectDialog",
    mixins: [LayoutMixin],
    components: {Aspect},
    props: {
      dialog_open: Boolean,
      show_aspect: Boolean,
      aspect: Object,
      mode: String,
      ext_value: {
        type: [Object, String, Number, Array]
      }
    },
    data() {
      return {
        int_value: this.ext_value
      }
    },
    computed: {
      done_button() {
        return ![DATE, SELECT, LOCATION].includes(this.aspect.type)
      }
    },
    methods: {
      update_value(value) {
        if (!this.done_button) {
          this.$emit("update:ext_value", value)
        } else {
          this.int_value = value
        }
      },
      done() {
        console.log("done")
        this.$emit("update:ext_value", this.int_value)
        this.$emit('update:dialog_open', false)
      }
    }
  }
</script>

<style scoped>

</style>
