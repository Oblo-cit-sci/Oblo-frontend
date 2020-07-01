<template lang="pug">
    v-select(
      :items="options"
      v-model="selection"
      hide-details
      single-line outlined :multiple="multiple" :chips="chips" clearable)

</template>

<script>
  import SelectMixin2 from "~/components/aspects/SelectMixin2"
  import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"

  export default {
  name: "SelectSelect",
  mixins: [AspectComponentMixin, SelectMixin2],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
