import {VISITOR} from "~/lib/consts"
import {USER_GET_USER_DATA} from "~/store"
import {place2str} from "~/lib/location"

export default {
  name: "ActorMixin",
  props: {
    actor: Object
  },
  methods: {
    avatar(actor) {
      return this.$api.url_actor__$registered_name__avatar(actor.registered_name)
    },
    goto_actor(actor) {
      if(!this.selectable)
        return
      if (actor.registered_name === VISITOR)
        return
      if (actor.registered_name === this.$store.getters[USER_GET_USER_DATA].registered_name) {
        this.$router.push("/profile")
      } else {
        this.$router.push({path: "/actor", query: {name: actor.registered_name}})
      }
    },
    place(location_data) {
      const place_data = this.$_.get(location_data, "place")
      if (place_data)
        return "Location: " + place2str(place_data)
      else
        return ""
    }
  }
}
