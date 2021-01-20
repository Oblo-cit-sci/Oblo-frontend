<template lang="pug">
  div
    MessageTranslationBlock(v-for="t in show_translations" :translation="t" :key="t.index")
    SimplePaginate(:total_pages="total_pages" v-model="page")
</template>

<script>
import {mapGetters} from "vuex";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";
import SimplePaginate from "~/components/SimplePaginate";

export default {
  name: "setup",
  components: {SimplePaginate, MessageTranslationBlock},
  created() {
    if(!this.translation.dest_lang) {
      this.$router.push("/translate/setup")
    }
  },
  data() {
    return {
      page: 1,
      messages_per_page: 20
    }
  },
  computed: {
    ...mapGetters({translation: "translate/translation"}),
    translations() {
      return this.translation.messages.map(msg => ({
        index: msg[0],
        languages: [this.translation.src_lang, this.translation.dest_lang],
        messages: [msg[1], msg[2]],
        dest_language: this.translation.dest_lang
      }))
    },
    total_pages() {
      // console.log("total", this.translations.length, this.translations.length / this.messages_per_page, Math.ceil(this.translations.length / this.messages_per_page))
      return Math.ceil(this.translations.length / this.messages_per_page)
    },
    show_translations() {
      return this.translations.slice((this.page - 1) * this.messages_per_page, (this.page) * this.messages_per_page)
    }
  },
  watch: {
    page(current, prev) {
      this.$vuetify.goTo("body", {offset: 0, duration: 1000, easing: "easeInOutCubic"})
    }
  }
}
</script>

<style scoped>

</style>
