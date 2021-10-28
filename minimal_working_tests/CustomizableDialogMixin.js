export default {
  name: "CustomizableDialogMixin",
  mixins: [],
  props: {
    dialog_open: {
      type: Boolean,
      required: true
    },
    persistent: Boolean
  },
  data() {
    return {
      value: false
    }
  },
  computed: {

  },
  methods: {
    close() {
      this.value = false
    }
  },
  watch: {
    dialog_open(open) {
      this.value = open
    },
    value(value) {
      this.$emit("update:dialog_open", value)
    }
  }
}
