<template lang="pug">
  div
    v-btn(to="/user_guide?guide=index" nuxt v-if="not_on_index") Back to index
    .main(v-html="user_guide_text")
</template>

<script>

import MarkdownIt from 'markdown-it';

export default {
  name: "user_guide",
  mixins: [],
  data() {
    return {
      user_guide_text: null
    }
  },
  created() {

  },
  computed: {
    not_on_index() {
      return this.guide_name !== "index"
    },
    guide_name() {
      return this.$route.query.guide || "index"
    }
  },
  methods: {
    fetch_guide() {
      this.$api.basic.user_guide(this.$store.getters.ui_language, this.guide_name).then(resp => {
        this.user_guide_text = MarkdownIt({html: true}).render(resp.data)
      }, err => {
        console.error(err)
      })
    }
  },
  watch: {
    guide_name: {
      immediate: true,
      handler: function() {
        this.fetch_guide()
      }
    }
  }
}
</script>

<style scoped>

</style>
