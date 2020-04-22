<template lang="pug">
  div
    Title_Description(header_type="h4" title="Navigate")
    div
      v-btn(:disabled="!more_prev_pages" @click="change_page(-1)" large outlined color="blue") {{prev_page_text}}
      v-btn(:disabled="!more_follow_page" @click="change_page(1)" large outlined color="blue") {{next_page_text}}
      span {{page_index}} / {{number_of_pages}}
    div(v-if="allow_jump && pages.length > 4")
      SingleSelect(
        :options="pages_options"
        :selection="selected_page"
        force_view="select"
        :only_value="true"
        :clearable="false"
        :select_sync="false"
        color="blue"
        v-on:selection="page_selected($event)")
    v-divider(class="wide_divider")
</template>

<script>
    import SingleSelect from "../input/SingleSelect";
    import Title_Description from "../util/Title_Description";
    import PaginateMixin from "../PaginateMixin";

    export default {
        name: "Paginate",
        components: {Title_Description, SingleSelect},
        mixins: [PaginateMixin]
    }
</script>

<style scoped>

</style>
