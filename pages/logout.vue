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
      this.$api.actor.logout().then(async ({data}) => {
        this.ok_snackbar(data.msg)
        this.clear_storage()
        // store back drafts
        this.persist_entries()
        await this.$store.dispatch("logout")
        this.$store.commit("menu/open", false)
      }).catch(async (err) => {
        console.log("logout error", err)
        if (this.$_.get(err, "response.status") === 401) {
          this.err_error_snackbar(err)
        }
        this.remove_from_storage("auth_token")
        await this.$store.dispatch("logout")
        this.$store.commit("menu/open", false)
      }).finally(() => {
        this.home()
      })
    }
  }
</script>

<style scoped>

</style>
