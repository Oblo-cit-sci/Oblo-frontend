<template lang="pug">
  v-card.mb-4.pb-1.cardheight(outlined :width="550" @click="goto_domain" :ripple="false")
    v-img(:src="image" :max-height="img_max_height")
      v-card-title.align-end.shadow {{title}}
      v-hover(v-for="lang in lang_ordered"
        :key="lang")
        v-chip.mt-2.ml-2(
          :style="{opacity:'85%'}"
          :color="lang_chip_color(lang, hover)"
          @click="to_language(lang)"
          slot-scope="{ hover }") {{$t("lang." + lang)}}
    v-card-text.pb-2(:style="{'min-height':'80px'}")
      v-img.float-left.mr-3.mb-1(:src="icon" left width="40" height="40")
      div {{description}}
</template>

<script>

import {PAGE_DOMAIN} from "~/lib/pages"
import DomainDataMixin from "~/components/domain/DomainDataMixin"
import {QP_D, QP_lang} from "~/lib/consts";
import LanguageMixin from "~/components/LanguageMixin";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";

export default {
  name: "DomainCard",
  mixins: [DomainDataMixin, LanguageMixin, ResponsivenessMixin],
  data() {
    return {
      language: null
    }
  },
  props: {
    languages: Array
  },
  computed: {
    lang_ordered() {
      let result = this.$_.clone(this.languages)
      const current_lang = this.$_.remove(result, l => l === this.$store.getters.ui_language)
      const default_lang = this.$_.remove(result, l => l === this.default_language)
      return this.$_.concat(current_lang, default_lang, result)
    },
    not_ui_lang() {
      return !this.languages.includes(this.$store.getters.ui_language)
    },
    img_max_height() {
      if (this.is_small) {
        return "120px"
      } else {
        return "auto"
      }
    }
  },
  methods: {
    async goto_domain() {
      const language = this.language ? this.language : this.$store.getters.ui_language
      console.log(language, this.get_domain_language())

      // todo this triggers to many things....?!
      if (this.get_domain_language() !== language) {
        await this.change_language(language, true, null, true)
      }
      await this.complete_language_domains(this.domain_name, language)
      console.log("setting to ", language)
      await this.$store.dispatch("domain/set_act_domain_lang", {domain_name:this.domain_name, language})
      await this.$router.push({name: PAGE_DOMAIN, query: {[QP_D]: this.domain_name, [QP_lang]: language}})
    },
    to_language(language) {
      this.language = language
    },
    lang_chip_color(language, hover) {
      return hover ? 'yellow' :'info'
    }
  }
}
</script>

<style scoped>
.shadow {
  text-shadow: 3px 3px 2px black;
  color: whitesmoke;
}

.cardheight {
  max-height: none !important;
}
</style>
