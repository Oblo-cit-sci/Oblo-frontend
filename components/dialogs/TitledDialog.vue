<template lang="pug">
    v-dialog(@click:outside="close()" :value="dialog_open" :width="width" :persistent="persistent" :style="{'overflow-x':'hidden'}")
      v-sheet.pa-1(color="white")
        ButtonTitleToolbar(:title="title" :btn_icon="close_btn_icon" @btn_pressed="close()")
        slot
</template>

<script>
import DialogMixin from "~/components/dialogs/DialogMixin"
import ButtonTitleToolbar from "~/components/util/ButtonTitleToolbar"

export default {
  name: "TitledDialog",
  mixins: [DialogMixin],
  components: {ButtonTitleToolbar},
  props: {
    persistent: Boolean,
    show_close_btn: Boolean,
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    close_btn_icon() {
      if(this.show_close_btn) {
        return "mdi-close"
      }
    }
  },
  methods: {},
  watch: {
    dialog_open(open) {
      this.$emit('update:dialog_open', open)
    }
  }
}
</script>

<style scoped>

</style>
