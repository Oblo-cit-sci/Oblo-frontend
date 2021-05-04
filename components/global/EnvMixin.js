import {is_standalone} from "~/lib/pwa";

export default {
  name: "EnvMixin",
  methods: {},
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
      return true // this.$store.getters["app/standalone"] || is_standalone()
    }
  }
}
