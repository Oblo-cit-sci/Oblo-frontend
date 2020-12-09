/**
 * NEEDS TO HAVE aspect in computed or data
 */
export default {
  data() {
    return {
    }
  },
  methods: {},
  computed: {
    attr() {
      return this.aspect.attr || {}
    }
  }
}
