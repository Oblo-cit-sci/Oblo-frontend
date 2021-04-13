export default {
  name: "OfflineMixin",
  computed: {
    is_offline() {
      if(this.$store.getters.dev_offline !== null)
        return this.$store.getters.dev_offline
      else
        return this.$nuxt.isOffline // true // this.$nuxt.isOffline
    }
  },
  methods: {
    switch_offline() {
      this.$store.commit("dev_switch_offline")
    }
  }
}
