<template lang="pug">
  v-dialog(v-model="dialog_open"
    :width="width"
    @click:outside="click_outside"
    :persistent="done_button")
    div.pl-2.pt-3(v-if="dialog_open && aspect" style="background:white")
      div.scroll
        Aspect(v-if="show_aspect"
          :aspect="aspect"
          :mode="mode"
          :ext_value="ext_value"
          :conditionals="conditionals"
          @update:ext_value="update_value($event)"
          @update:error="error = $event")
      div
        v-btn(v-if="done_button" @click="cancel()") {{$t("w.cancel")}}
        v-btn(v-if="done_button" :disabled="error" @click="done()" color="success") {{$t("w.done")}}
</template>

<script>
import LayoutMixin from "~/components/global/LayoutMixin"
import {DATE, EDIT, LOCATION, SELECT} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import DialogMixin from "~/components/dialogs/DialogMixin"

export default {
  name: "AspectDialog",
  mixins: [LayoutMixin, DialogMixin],
  components: {Aspect},
  props: {
    show_aspect: {
      type: Boolean,
      default: true
    },
    aspect: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: EDIT
    },
    ext_value: {
      type: [Object, String, Number, Array, Boolean]
    },
    conditionals: {
      type: [Array, Object]
    }
  },
  data() {
    return {
      int_value: null,
      error: false
    }
  },
  computed: {
    done_button() {
      return ![DATE, SELECT, LOCATION].includes(this.aspect.type)
    },
    width() {
      if (this.fix_width)
        return this.fix_width
      else
        return this.main_container_with
    }
  },
  created() {
    this.int_value = this.ext_value
  },
  methods: {
    click_outside() {
      if (!this.done_button) {
        this.close()
      }
    },
    update_value(value) {
      if (!this.done_button) {
        this.$emit("update:ext_value", value)
        this.close()
      } else {
        this.int_value = value
      }
    },
    cancel() {
      this.close()
    },
    done() {
      // console.log("ASpDia-done", this.int_value)
      this.$emit("update:ext_value", this.int_value)
      this.close()
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
