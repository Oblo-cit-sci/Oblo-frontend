import {aspect_default_value, aspect_raw_default_value} from "~/lib/aspect"

/**
 * NEEDS TO HAVE aspect in computed or data
 */
export default {
  data() {
    return {}
  },
  methods: {
    raw_default_value() {
      return aspect_raw_default_value(this.aspect)
    },
    default_value() {
      return aspect_default_value(this.aspect)
    },
    get_attr(aspect) {
      return aspect.attr || {}
    }
  },
  computed: {
    attr() {
      return this.get_attr(this.aspect)
    },
  }
}
