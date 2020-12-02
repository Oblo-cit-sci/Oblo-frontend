
export default {
  name: "EnvMixin",
  methods: {
    // todo, where is this called?. make it computed and use everywhere.
    env() {
      return process.env.NODE_ENV
    }
  },
  computed: {
    // todo use OfflineModeMixin?
    online() {
      return this.$nuxt.isOnline
    },
    hostname() {
      return process.env.HOSTNAME
    },
    is_dev() {
      return this.env === "development"
    },
    is_prod() {
      return this.env === "production"
    }
  }
}
