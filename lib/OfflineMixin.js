export default {
  name: "OfflineMixin",
  computed: {
    is_offline() {
      return  this.$nuxt.isOffline // true // this.$nuxt.isOffline
    }
  },
}
