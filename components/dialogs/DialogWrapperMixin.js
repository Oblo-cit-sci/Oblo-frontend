export default {
  name: "DialogMixin",
  mixins: [],
  props: {
    dialog_open: {
      type: Boolean,
      required: true
    },
    persistent: Boolean,
    color: {
      type: String,
      default: "white"
    },
    fix_width: Number
  },
  data() {
    return {
      value: false
    }
  },
  computed: {
    width() {
      if (this.fix_width)
        return this.fix_width
      else
        return 400 //this.main_container_with
    }
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
