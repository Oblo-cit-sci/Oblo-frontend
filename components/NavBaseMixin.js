import {VIEW} from "../lib/consts";
import {get_proper_mode} from "~/lib/entry";

export default {
  name: "NavBaseMixin",
  methods: {
    to_entry(uuid, mode = VIEW, query = {}) {
      // console.log("to entry")
      let route = {
        name: "entry",
        query: {
          uuid,
          entry_mode: mode,
          ...query
        }
      }
      this.$router.push(route)
    }
  }
}
