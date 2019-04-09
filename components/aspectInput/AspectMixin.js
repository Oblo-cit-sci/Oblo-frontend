export default {
  props: ["aspect", "value"],
  data() {
    return {
      i_value: null
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
