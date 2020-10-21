<template lang="pug">
    v-dialog(@click:outside="close()" :value="dialog_open" :width="width" :persistent="persistent" :style="{'overflow-x':'hidden'}")
      v-sheet.pa-1(color="white")
        v-toolbar(flat)
          v-btn(v-if="show_close_btn" icon @click="close()")
            v-icon mdi-close
          v-toolbar-title
            span.font-weight-bold {{title}}
        slot
</template>

<script>
import DialogMixin from "~/components/dialogs/DialogMixin"

export default {
  name: "TitledDialog",
  mixins: [DialogMixin],
  components: {},
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
  computed: {},
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
