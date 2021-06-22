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
        v-btn(v-if="done_button" :disabled="disable_done" @click="done()" color="success") {{$t("w.done")}}
</template>

<script>
import LayoutMixin from "~/components/global/LayoutMixin"
import {DATE, EDIT, LOCATION, SELECT} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import DialogMixin from "~/components/dialogs/DialogMixin"
import {isEqual_default_value} from "~/lib/aspect";

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
    has_value() {
      // console.log("has-value", this.int_value?.value, aspect_default_value(this.aspect))
      // const value_is_default = this.$_.isEqual(this.int_value?.value, aspect_default_value(this.aspect))
      // console.log(this.int_value, aspect_default_value(this.aspect))
      // console.log(this.aspect)
      // console.log("has-value",value_is_default, !value_is_default)
      // TODO does this work for all aspect-types of on options-aspect (in the filter-list)
      return !isEqual_default_value(this.int_value, this.aspect) //!this.$_.isEqual(this.int_value?.value, aspect_default_value(this.aspect))
    },
    disable_done() {
      // console.log("disable_done", this.has_value)
      return this.error || !this.has_value
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
  },
  watch: {
    ext_value() {
      this.int_value = this.ext_value
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
