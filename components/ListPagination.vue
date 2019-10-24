<template lang="pug">
  div.inline
    v-btn(:disabled="!more_prev_pages" @click="change_page(-1)") {{prev_page_text}}
    v-btn(:disabled="!more_follow_page" @click="change_page(1)") {{next_page_text}}
    span {{page + 1}} / {{total}}
</template>

<script>

    import PaginateMixin from "./PaginateMixin";

    export default {
        name: "ListPagination",
        mixins: [PaginateMixin],
    }
</script>

<style scoped>

  .inline {
    display: inline-block;
    position: absolute;
  }
</style>
