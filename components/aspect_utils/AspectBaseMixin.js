import {aspect_default_value, aspect_raw_default_value, attr} from "~/lib/aspect"

/**
 * NEEDS TO HAVE aspect in computed or data
 */
export default {
  data() {
    return {}
  },
  created(){
    if(!this.aspect) {
      console.warn("AspectBaseMixin: aspect is not defined")
    }
  },
  methods: {
    raw_default_value() {
      return aspect_raw_default_value(this.aspect)
    },
    default_value() {
      return aspect_default_value(this.aspect)
    },
    get_attr(aspect) {
      return attr(aspect)
    }
  },
  computed: {
    attr() {
      return this.get_attr(this.aspect)
    },
  }
}
