<template lang="pug">
  v-list
    v-list-item-group(v-model="selection_index" :multiple="multiple")
      v-list-item(v-for="option in options" :key="option.value")
        v-list-item-content {{option.text}}
</template>

<script>
  import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
  import SelectMixin2 from "~/components/aspects/SelectMixin2"

  export default {
    name: "SelectList",
    mixins: [AspectComponentMixin, SelectMixin2],
    components: {},
    props: {},
    data() {
      return {}
    },
    computed: {

    },
    methods: {}
  }
</script>

<style scoped>

</style>
