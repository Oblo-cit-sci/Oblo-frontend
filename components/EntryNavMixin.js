import {fetch_entry} from "../lib/entry";

export default {
  methods: {
    fetch_and_nav(uuid) {
      fetch_entry(this.$store, this.$axios, uuid).then(entry => {
        this.$router.push("/entry/"+uuid)
      }).catch(res => {
        console.log(res)
        // todo ENH: could also be an error msg from the server
        this.$store.commit("set_error_snackbar", "Couldn't fetch entry")
      })
    }
  }
}
