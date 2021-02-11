<template lang="pug">
  v-card(class="mb-10" outlined :width="550" @click="goto_domain" :ripple="false")
    v-img(:src="image" max-height="auto")
      v-card-title.align-end.shadow {{title}}
      v-hover(v-for="lang in languages"
        v-if="not_ui_lang"
        :key="lang")
        v-chip.mt-2.ml-2(
          :style="{opacity:'70%'}"
          :color="hover ? 'yellow' :'info'"
          @click="to_language(lang)"
          slot-scope="{ hover }") {{$t("lang." + lang)}}
    v-card-text
      v-img.float-left.mr-3.mb-1(:src="icon" left width="40" height="40")
      span {{description}}
</template>

<script>
// import {GET_DOMAIN_TEMPLATES_FETCHED, SET_DOMAIN, SET_TEMPLATES_CODES_FOR_DOMAIN} from "../store";

import {PAGE_DOMAIN} from "~/lib/pages"
import DomainDataMixin from "~/components/domain/DomainDataMixin"
import {QP_D, QP_lang} from "~/lib/consts";
import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "DomainCard",
  mixins: [DomainDataMixin, LanguageMixin],
  data() {
    return {
      language: null
    }
  },
  props: {
    languages: Array
  },
  computed: {
    not_ui_lang() {
      return !this.languages.includes(this.$store.getters.ui_language)
    }
  },
  methods: {
    async goto_domain() {
      const language = this.language ? this.language : this.$store.getters.ui_language
      await this.complete_language_domains(this.domain_name, language)
      await this.$router.push({name: PAGE_DOMAIN, query: {[QP_D]: this.domain_name}})
    },
    to_language(language) {
      this.language = language
    }
  }
}
</script>

<style scoped>
.shadow {
  text-shadow: 3px 3px 2px black;
  color: whitesmoke;
}
</style>
