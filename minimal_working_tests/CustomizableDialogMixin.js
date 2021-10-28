export default {
  name: "CustomizableDialogMixin",
  mixins: [],
  props: {
    value: Boolean,
    persistent: Boolean
  },
  data() {
    return {
      // dialog_open: false
    }
  },
  computed: {
    dialog_open: {
      set(open) {
        this.$emit("input", open)
      },
      get() {
        return this.value
      }
    }

  },
  methods: {
    close() {
      this.dialog_open = false
    }
  },
  watch: {
    // dialog_open(open) {
    //   this.$emit("input", open)
    // },
    // value(value) {
    //   this.dialog_open = value
    // }
  }
}
