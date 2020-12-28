/**
 * NEEDS TO HAVE aspect in computed or data
 */
export default {
  data() {
    return {
    }
  },
  methods: {
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
