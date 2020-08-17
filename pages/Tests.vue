<template lang="pug">
  div
    v-btn(@click="snack") snack
</template>

<script>



import OptionsMixin from "~/components/aspect_utils/OptionsMixin"
import TagsMixin from "~/lib/TagsMixin"
import SingleSelect from "~/components/input/SingleSelect"
import EntryFetchMixin from "~/components/entry/EntryFetchMixin"
import EntryPreview from "~/components/entry/EntryPreview"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"

export default {
  name: "Tests",
  mixins: [EntryFetchMixin, TriggerSnackbarMixin],
  components: {
  },
  created() {
    this.guarantee_entry("b76ecefb-88dd-4d52-a4f3-ec5118737bcf")
  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
    snack() {
      this.ok_snackbar("cool"+ new Date())
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
