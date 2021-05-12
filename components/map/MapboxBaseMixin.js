export default {
  name: "MapboxBaseMixin",
  data() {
    return {
      // access_token:
    }
  },
  computed: {
    access_token() {
      return this.$store.getters["map/access_token"]
    }
  }
}
