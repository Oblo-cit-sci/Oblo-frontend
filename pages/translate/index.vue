<template lang="pug">
  div
    MessageTranslationBlock(v-for="t in translations" :translation="t" :key="t.index")
</template>

<script>
import {mapGetters} from "vuex";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";

export default {
  name: "setup",
  components: {MessageTranslationBlock},
  computed: {
    ...mapGetters({translation: "translate/translation"}),
    translations() {
      return this.translation.messages.map(msg => ({
        index: msg[0],
        languages: [this.translation.src_lang, this.translation.dest_lang],
        messages: [msg[1], msg[2]],
        dest_language: this.translation.dest_lang
      }))
    }
  }
}
</script>

<style scoped>

</style>
