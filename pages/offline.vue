<template lang="pug">
  v-container(fluid)
    div You are offline {{is_online}}
</template>

<script>
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import HomePathMixin from "~/components/menu/HomePathMixin"

export default {
  name: "offline",
  mixins: [TriggerSnackbarMixin, HomePathMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {
    is_online() {
      return this.$nuxt.isOnline
    }
  },
  methods: {},
  watch: {
    is_online(online) {
      this.ok_snackbar("You are connected")
      this.set_home_path()
    }
  }
}
</script>

<style scoped>

</style>
