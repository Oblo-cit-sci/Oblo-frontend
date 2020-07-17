<template lang="pug">
  div(v-if="!value")
    Search(:show_results="false" :show_filter="false")
  div(v-else)
    div {{entrytitle}}
</template>

<script>
import Search from "~/components/global/Search"
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import EntryNavMixin from "~/components/EntryNavMixin"

export default {
  name: "EntryLink",
  mixins: [AspectComponentMixin, EntryNavMixin],
  components: {Search},
  props: {},
  data() {
    return {
      entrytitle: ""
    }
  },
  created() {
    if(this.value) {
      if (!this.has_entry(this.value)) {
        this.fetch(this.value).then(entry => {
          console.log(entry)
          this.entrytitle = entry.title
        })
      } else {
        this.entrytitle = this.$store.getters["entries/get_entry"](this.value).title
      }
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
