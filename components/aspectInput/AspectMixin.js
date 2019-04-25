export default {
  props: {
    aspect: Object,
    value: {},
    edit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      i_value: null,
    }
  },
  created() {
    this.i_value = this.value;
  },
  methods: {
    value_change(event) {
      this.$emit('update:value', event)
    }
  }
}
