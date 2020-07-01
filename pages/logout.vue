<template lang="pug">


</template>

<script>
  import {LOGOUT} from "~/store"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"

  export default {
    name: "logout",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin],
    components: {},
    props: {},
    data() {
      return {}
    },
    computed: {},
    methods: {},
    created() {
      this.$api.actor__logout().then(() => {
        this.ok_snackbar("You are logged out")
        this.clear_storage()
        // todo, remove draft entries and update storage, to leave no traces...
        this.$store.dispatch(LOGOUT)
        this.$store.commit("menu/open", false)
        this.home()
      }).catch((err) => {
        console.log("logout error", err)
        if (this.$_.get(err, "response.status") === 401) {
          this.ok_snackbar("You are logged out")
        }
        this.remove_from_storage("auth_token")
        this.$store.dispatch(LOGOUT)
        this.$store.commit("menu/open", false)
        this.home()
      })
    }
  }
</script>

<style scoped>

</style>
