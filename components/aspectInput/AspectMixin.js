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
      //required: false
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
    title_description() {
      //console.log("title-descr for ", this.aspect);
      if (!this.aspect.hasOwnProperty("name")) {
        console.log("warning: aspect", this.aspect, "has no name")
      }
      if (!this.aspect.hasOwnProperty("description")) {
        console.log("warning: aspect", this.aspect, "has no description")
      }
      return {
        title: this.aspect.name || "",
        description: this.aspect.description || ""
      }
    },
    value_change(event) {
      console.log("value-change", event)
      this.$emit('update:value', event);
    }
  },
  watch: {
    value(new_val) {
      this.i_value = new_val;
    }
  }
}

