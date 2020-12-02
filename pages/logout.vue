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
      this.$api.actor.logout().then(({data}) => {
        this.ok_snackbar(data.msg)
        this.clear_storage()
        // store back drafts
        this.persist_entries()
        this.$store.dispatch("logout")
        this.$store.commit("menu/open", false)
        this.home()
      }).catch((err) => {
        console.log("logout error", err)
        if (this.$_.get(err, "response.status") === 401) {
          this.err_error_snackbar(err)
        }
        this.remove_from_storage("auth_token")
        this.$store.dispatch("logout")
        this.$store.commit("menu/open", false)
        this.home()
      })
    }
  }
</script>

<style scoped>

</style>
