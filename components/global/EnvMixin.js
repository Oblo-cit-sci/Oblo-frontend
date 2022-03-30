import {is_standalone} from "~/lib/pwa";

export default {
  name: "EnvMixin",
  methods: {
    get_env_dev_variable(name, default_value = false) {
      return this.$_.get(this.$nuxt.context.env, `DEV_CONFIG.${name}`, default_value)
    },
  },
  computed: {
    env() {
      return process.env.NODE_ENV
    },
    hostname() {
      return process.env.HOSTNAME
    },
    is_dev() {
      return this.env === "development"
    },
    is_prod() {
      return this.env === "production"
    },
    is_standalone() {
      return this.$store.getters["app/standalone"] || is_standalone()
    }
  }
}
