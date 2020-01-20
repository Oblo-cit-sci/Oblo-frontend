import {VIEW} from "../lib/consts";

export default {
  name: "NavBaseMixin",
  methods: {
    to_entry(uuid, mode = this.proper_mode_for(uuid), query = {}) {

      let route = {
        name: "entry-uuid",
        params: {
          uuid: uuid
        },
        query: {
          mode: mode,
          ...query
        }
      }
      this.$router.push(route)
    },
    proper_mode_for(uuid) {
      return this.$store.getters['entries/get_propper__mode'](uuid)
    }
  }
}
