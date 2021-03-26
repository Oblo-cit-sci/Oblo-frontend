<template lang="pug">
  div
    v-btn( to="user_guide?guide=index" nuxt) Back to index
    .main(v-html="user_guide_text")
</template>

<script>

import MarkdownIt from 'markdown-it';

export default {
  name: "user_guide",
  mixins: [],
  data() {
    return {
      guide_name: null,
      user_guide_text: null
    }
  },
  created() {
    this.guide_name = this.$route.query.guide || "index"
    this.$api.axios.get("api/basic/user_guide", {
      params: {
        language: this.$store.getters.ui_language,
        user_guide_name: this.guide_name
      }
    }).then(resp => {
      this.user_guide_text = MarkdownIt({html:true}).render(resp.data)
    }, err => {
      console.error(err)
    })
  },
  computed: {
    guide_name() {

    }
  },
  watch: {
    guide_name(new_name, old_name) {
      console.log(new_name, old_name)
    }
  }
}
</script>

<style scoped>

</style>
