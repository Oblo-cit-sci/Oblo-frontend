<template lang="pug">
  v-card.mb-4.pb-1.cardheight(outlined :width="550" @click="goto_domain()" :ripple="false")
    v-img(:src="domain_banner_url" :max-height="img_max_height")
      v-card-title.align-end.shadow {{domain_title}}
      v-hover(v-for="lang in lang_ordered"
        :key="lang")
        v-chip.mt-2.ml-2(
          :style="{opacity:'85%'}"
          :color="lang_chip_color(lang, hover)"
          @click="selected_language = lang"
          slot-scope="{ hover }") {{$t("lang." + lang)}}
    v-card-text.pb-2(:style="{'min-height':'80px'}")
      v-img.float-left.mr-3.mb-1(:src="domain_icon_url" left width="40" height="40")
      div
        LanguageChip.mr-1(v-if="alternative_language"  :style="{top:'-4px'}"
          :language_code="alternative_language" :full_name="false" small)
        span {{domain_description}}
</template>

<script>

import DomainDataMixin from "~/components/domain/DomainDataMixin"
import LanguageMixin from "~/components/LanguageMixin";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import {PAGE_DOMAIN} from "~/lib/pages"
import {QP_D, QP_lang} from "~/lib/consts"
import {domain_banner_url, domain_description, domain_icon_url, domain_title} from "~/lib/domain_data"
import LanguageChip from "~/components/language/LanguageChip";

export default {
  name: "DomainCard",
  components: {LanguageChip},
  mixins: [DomainDataMixin, LanguageMixin, ResponsivenessMixin],
  data() {
    return {
      // we need to work with this instead of having the chip trigger the goto. cuz is triggered twice...
      selected_language: null
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
    img_max_height() {
      if (this.is_small) {
        return "110px"
      } else {
        return "160px"
      }
    },
    domain_title() {
      return domain_title(this.domain_data)
    },
    domain_description() {
      return domain_description(this.domain_data)
    },
    domain_banner_url() {
      return domain_banner_url(this.$api, this.domain_name)
    },
    domain_icon_url() {
      return domain_icon_url(this.$api, this.domain_name)
    },
    /**
     * returns if the title/description differ from the UI language. in that case a chip with teh lang is shown
     * @returns null if its the same as the UI lang, otherwise return the language
     */
    alternative_language() {
      if (this.domain_data.language !== this.$store.getters.ui_language) {
        return this.languages[0]
      }
      return null
    }
  },
  methods: {
    async goto_domain() {
      let language = this.selected_language ? this.selected_language : this.$store.getters.ui_language
      if (!this.languages.includes(language)) {
        language = this.languages[0]
      }
      // console.log("-->", language)
      // console.log(this.get_domain_language(), language)
      await this.complete_language_domains(this.domain_name, language)

      if (this.get_domain_language() !== language) {
        await this.change_language(language, true, null, true)
      }

      await this.$store.dispatch("domain/set_act_domain_lang", {domain_name: this.domain_name, language})
      await this.$router.push({name: PAGE_DOMAIN, query: {[QP_D]: this.domain_name, [QP_lang]: language}})
    },
    lang_chip_color(language, hover) {
      return hover ? 'yellow' : 'info'
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
