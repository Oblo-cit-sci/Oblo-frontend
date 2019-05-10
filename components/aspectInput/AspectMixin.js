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
      required: false
    }
  },
  created() {
    this.i_value = this.value;
    if (this.aspect.required) {
      this.required = true;
      this.$emit('update-required', {title: this.aspect.name, value: this.i_value})
    }
  },
  methods: {
    value_change(event) {
      this.$emit('update:value', event);
      if (this.required) {
        console.log("required value changed");
        this.$emit('update-required', {title: this.aspect.name, value: this.i_value})
      }
    }
  },
  watch: {
    value(new_val) {
      this.i_value = new_val;
    }
  }
}

