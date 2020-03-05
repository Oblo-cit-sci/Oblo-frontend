<template lang="pug">
  div
    v-btn(:disabled="!_has_prev" @click="change_page(-1)" outlined color="blue") Back
    v-btn(:disabled="!_has_next" @click="change_page(1)" outlined color="blue") Next
    div.ml-2
      span page: {{page + 1}} &nbsp;
      span(v-if="total_pages") / {{total_pages}}

</template>

<script>
  export default {
    name: "SimplePaginate",
    mixins: [],
    components: {},
    props: {
      value: Number,
      total_pages: Number,
      has_next: Boolean
    },
    data() {
      return {}
    },
    created() {
      if (this.total_pages === undefined && this.has_next === undefined) {
        console.log("SimplagePaginate error. Either total_pages or has_next must be specified")
      }
    },
    computed: {
      page() {
        return this.value
      },
      _has_next() {
        if (this.total_pages) {
          return this.page < this.total_pages - 1
        } else {
          return this.has_next
        }
      },
      _has_prev() {
        return this.page > 0
      }
    },
    methods: {
      change_page(dir) {
        this.$emit('input', this.page + dir)
      }
    },
    watch: {}
  }
</script>

<style scoped>

</style>
