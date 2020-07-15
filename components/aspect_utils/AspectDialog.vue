<template lang="pug">
  v-dialog(v-model="dialog_open"
    :width="width"
    persistent)
    div.pl-2.pt-3(v-if="dialog_open && aspect" style="background:white")
      div.scroll
        Aspect(v-if="show_aspect"
          :aspect="aspect"
          :mode="mode"
          :ext_value="ext_value"
          @update:ext_value="update_value($event)"
          @update:error="error = $event")
      div
        v-btn(v-if="done_button" @click="cancel()") Cancel
        v-btn(v-if="done_button" :disabled="error" @click="done()" color="success") Done
</template>

<script>
  import LayoutMixin from "~/components/global/LayoutMixin"
  import {DATE, EDIT, LOCATION, SELECT} from "~/lib/consts"
  import Aspect from "~/components/Aspect"

  export default {
    name: "AspectDialog",
    mixins: [LayoutMixin],
    components: {Aspect},
    props: {
      dialog_open: Boolean,
      fix_width: Number,
      show_aspect: {
        type: Boolean,
        default: true
      },
      aspect: Object,
      mode: {
        type: String,
        default: EDIT
      },
      ext_value: {
        type: [Object, String, Number, Array, Boolean]
      }
    },
    data() {
      return {
        int_value: this.ext_value,
        error: false
      }
    },
    computed: {
      done_button() {
        return ![DATE, SELECT, LOCATION].includes(this.aspect.type)
      },
      width() {
        if(this.fix_width)
          return this.fix_width
        else
          return this.main_container_with
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
      cancel() {
        this.$emit('update:dialog_open', false)
      },
      done() {
        this.$emit("update:ext_value", this.int_value)
        this.$emit('update:dialog_open', false)
      }
    }
  }
</script>

<style scoped>

  .scroll {
    overflow-y: auto;
    max-height: 800px
  }
</style>
