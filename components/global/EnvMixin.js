import {dev_env} from "~/lib/util"

export default {
  name: "EnvMixin",
  computed: {
    is_dev() {
      return dev_env();
    },
    is_prod() {
      return env() === "production"
    }
  }
}
