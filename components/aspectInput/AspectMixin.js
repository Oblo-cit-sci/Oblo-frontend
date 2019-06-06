import {aspect_default_value} from "../../lib/entry";

export default {
  props: {
    aspect: Object,
    value: {},
    // simplification of mode
    edit: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    extra: Object,
    hide: Array// todo implement
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
      //console.log("asp mix", event)
      this.$emit('update:value', event);
    }
  },
  watch: {
    value(new_val) {
      this.i_value = new_val;
    },
    disabled() {
      this.i_value = aspect_default_value(this.aspect)
    }
  }
}

