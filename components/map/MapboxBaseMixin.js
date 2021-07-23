export default {
  name: "MapboxBaseMixin",
  data() {
    return {
    }
  },
  computed: {
    access_token() {
      return this.$store.getters["map/access_token"]
    }
  }
}
