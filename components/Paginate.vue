<template lang="pug">
  div
    v-btn(:disabled="has_prev_pages" @click="prev_page") Previous Page
    v-btn(:disabled="has_next_pages" @click="next_page") Next Page
</template>

<script>
  export default {
    name: "Paginate",
    props: {
      total: Number,
      page: Number
    },
    computed: {
      has_next_pages() {
        return !(this.page < this.total - 1)
      },
      has_prev_pages() {
        return !(this.page > 0)
      },
    },
    methods: {
      prev_page() {
        this.$emit("update:page", this.page - 1)
        this.$emit("lastpage", !this.has_next_pages)
      },
      next_page() {
        this.$emit("update:page", this.page + 1)
        this.$emit("lastpage", !this.has_next_pages)
      }
    }
  }
</script>

<style scoped>

</style>
