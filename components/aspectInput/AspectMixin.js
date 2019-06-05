export default {
  props: {
    aspect: Object,
    value: {},
    // simplification of mode
    edit: {
      type: Boolean,
      default: true
    },
    hide: {
      // todo implement
      type: Array // can include "title", "description"
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
  },
  methods: {
    title_description() {
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
      this.$emit('update:value', event);
    }
  },
  watch: {
    value(new_val) {
      this.i_value = new_val;
    }
  }
}

