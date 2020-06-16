<template lang="pug">
  v-navigation-drawer(
    v-model="drawer_state"
    :temporary="over"
    :hide-overlay="over"
    :stateless="over"
    :style="behind_style"
    app)
    MainMenuList
</template>

<script>
  import {USER_LOGGED_IN} from "~/store/user"
  import {APP_CONNECTED} from "~/store/app"
  import {mapGetters} from "vuex"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import LanguageSelector from "~/components/LanguageSelector"
  import MainMenuList from "~/components/menu/MainMenuList"

  export default {
    name: "MainMenu",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin],
    components: {MainMenuList, LanguageSelector},
    props: {
      over: Boolean
    },
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        logged_in: USER_LOGGED_IN,
        connected: APP_CONNECTED,
        nav_drawer: "app/nav_drawer"
      })
    }
  }
</script>

<style scoped>

</style>
