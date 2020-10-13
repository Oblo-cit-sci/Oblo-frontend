<template lang="pug">
  v-container(fluid)
    div You are offline {{is_online}}
    Aspect(:aspect="asp" :ext_value="'cool'" mode="flex")
</template>

<script>
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import HomePathMixin from "~/components/menu/HomePathMixin"
import Aspect from "~/components/Aspect"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

export default {
  name: "offline",
  mixins: [TriggerSnackbarMixin, HomePathMixin, TypicalAspectMixin],
  components: {Aspect},
  props: {},
  data() {
    return {
      asp: this.asp_public_name()
    }
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
