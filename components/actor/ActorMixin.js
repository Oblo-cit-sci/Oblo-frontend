import {VISITOR} from "~/lib/consts"
import {place2str} from "~/lib/location"

export default {
  name: "ActorMixin",
  props: {
    actor: Object,
    selectable: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    avatar(actor) {
      return this.$api.actor.url_avatar(actor.registered_name)
    },
    goto_actor(actor) {
      // console.log(actor)
      if(!this.selectable)
        return
      if (actor.registered_name === VISITOR)
        return
      if (actor.registered_name === this.$store.getters.name) {
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
