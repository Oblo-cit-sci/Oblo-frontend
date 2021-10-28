// demo minimal_working_tests/CustomizableDialogMixin
export default {
  name: "DialogMixin",
  mixins: [],
  props: {
    value: Boolean,
    persistent: Boolean
  },
  data() {
    return {
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
  }
}
