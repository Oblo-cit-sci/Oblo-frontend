import {aspect_default_value} from "~/lib/aspect"

export default {
  name: "AspectSetMixin",
  props: {},
  data() {
    return {
      aspects_set: false,
      values: {},
      errors: {}
    }
  },
  computed: {
    has_errors() {
      return this.get_errors.length > 0
    },
    get_errors() {
      if (!this.aspects_set) {
        return []
      }
      return this.$_.filter(this.errors, e => e)
    }
  },
  methods: {
    set_aspects(aspects) {
      const aspectMap = this.$_.keyBy(aspects, "name")
      // todo values, should also be setable. for now just used for the err in entry-roles
      this.values = this.$_.mapValues(aspectMap, a => aspect_default_value(a))
      this.errors = this.$_.mapValues(aspectMap, a => null)
      this.aspects_set = true
    },
    update_error(aspect_name, error) {
      // console.log("error update", aspect_name, error)
      this.errors[aspect_name] = error
    }
  }
}
