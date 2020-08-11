<template lang="pug">
  div
    EntryPreview(passed_uuid="b76ecefb-88dd-4d52-a4f3-ec5118737bcf" :show_tags="true")
</template>

<script>



import OptionsMixin from "~/components/aspect_utils/OptionsMixin"
import TagsMixin from "~/lib/TagsMixin"
import SingleSelect from "~/components/input/SingleSelect"
import EntryFetchMixin from "~/components/entry/EntryFetchMixin"
import EntryPreview from "~/components/entry/EntryPreview"

export default {
  name: "Tests",
  mixins: [EntryFetchMixin],
  components: {
    EntryPreview
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
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
