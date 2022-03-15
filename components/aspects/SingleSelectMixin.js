export default {
  props: {
    options: {
      type: Array,
      required: true
    },
    selection: {
      type: Object,
      required: true
    }
  },
  computed: {
    selection_index() {
      return this.$_.findIndex(this.options, o => this.$_.isEqual(o.value, this.selection.value))
    }
  },
  methods: {
    is_selected(index) {
      return index === this.selection_index
    }
  }
}
