
export default {
  name: "EnvMixin",
  methods: {
    env() {
      return process.env.NODE_ENV
    }
  },
  computed: {
    // todo use OfflineModeMixin?
    online() {
      return this.$nuxt.isOnline
    },
    is_dev() {
      return this.env === "development"
    },
    is_prod() {
      return this.env === "production"
    }
  }
}
