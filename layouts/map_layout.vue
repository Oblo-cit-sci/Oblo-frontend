<template lang="pug">
  v-app
    v-content
      v-container(v-if="initialized" id="fullContainer")
        nuxt
      GlobalSnackbar
</template>

<script>
  import GlobalSnackbar from "../components/global/GlobalSnackbar";
  import {initialize, reload_storage} from "~/lib/client"
  import {dev_env} from "~/lib/util"

  import {mapGetters} from "vuex"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import {APP_CONNECTED, APP_DB_LOADED, APP_INITIALIZED} from "~/store/app"
  import {USER_LOGGED_IN} from "~/store/user"

  export default {
    name: "map_layout",
    mixins: [PersistentStorageMixin],
    components: {GlobalSnackbar},
    created() {
      console.log("layout create", this.db_loaded)
      if (!this.db_loaded)
        reload_storage(this.$store, this.$localForage)
      if (!this.$api.is_initialized()) {
        this.$api.init(this.$axios) // , "https://opentek.eu"
        if (!dev_env()) {
          this.privacy_sheet_open = true
        }
      }
    },
    computed: {
      ...mapGetters({
        db_loaded: APP_DB_LOADED,
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED,
        initialized: APP_INITIALIZED,
      })
    },
    watch: {
      db_loaded(val) {
        // console.log("db loaded", this.initialized)
        if (val) {
          console.log("layout. initializing")
          initialize(this.$api, this.$store, this.$route, this.$router, this.$localForage)
        }
      }
    }
  }
</script>

<style scoped>


  #fullContainer {
    max-width: 100%;
    padding: 0;
    height: 100%;
  }
</style>
