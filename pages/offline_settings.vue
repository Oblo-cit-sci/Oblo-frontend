<template lang="pug">
  div
    h1 {{$t("page.offline_settings.h1")}}
    div(v-if="loaded")
      Aspect(:aspect="messages_languages_aspect" :ext_value.sync="messages_languages_value"
        mode="edit" @aspectAction="delete_languages()")
      Aspect(:aspect="lang_domain_aspect" :ext_value.sync="lang_domain_value" mode="edit")
      //div {{downloaded_domains}}
    //div {{prompt_set}}
    //div(v-if="!is_pwa")
    //  v-btn(@click="install_pwa") install
    //div {{is_offline}}
</template>

<script>
import {install_pwa, is_prompt_set} from "~/lib/pwa";
import OfflineMixin from "~/lib/OfflineMixin"
import {MULTISELECT, NO_DOMAIN} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import {pack_value} from "~/lib/aspect"
import LanguageMixin from "~/components/LanguageMixin"
import EnvMixin from "~/components/global/EnvMixin";

export default {
  name: "offline_settings",
  components: {Aspect},
  mixins: [OfflineMixin, LanguageMixin, EnvMixin],
  data() {
    return {
      loaded: false,
      offline_data: {},
      // todo replace with typicalAspect.asp_language
      messages_languages_aspect: {
        type: MULTISELECT,
        name: "languages",
        t_label: 'w.languages',
        attr: {
          action: {
            type: "emit",
            name: "delete_languages",
            trigger: {
              type: "button",
              button_label: "delete"
            }
          }
        },
        items: []
      },
      messages_languages_value: pack_value([]),
      lang_domain_aspect: {
        type: MULTISELECT,
        name: "domains",
        attr: {
          action: {
            type: "emit",
            name: "delete_lang_domains",
            trigger: {
              type: "button",
              button_label: "delete"
            }
          }
        },
        items: []
      },
      lang_domain_value: pack_value([])
    }
  },
  created() {
    this.get_offline_data().then(data => {
      this.offline_data = data
      this.loaded = true
      this.messages_languages_aspect.items = this.get_language_options(this.downloaded_messages_languages)
      this.lang_domain_aspect.items = this.downloaded_domains.map(d => ({
        value: `${d.name}_${d.lang}`,
        text: `${d.title} / ${this.t_lang(d.lang)}`
      }))
    })
  },
  computed: {
    prompt_set() {
      return is_prompt_set()
    },
    downloaded_messages_languages() {
      if (!this.loaded) {
        return []
      }
      return Array.from(Object.keys(this.offline_data.messages))
    },
    downloaded_domains() {
      if (!this.loaded) {
        return []
      }
      const real_domains = this.offline_data.domain_data.filter(d => d[0] !== NO_DOMAIN).map(d => d[1])
      return  real_domains.reduce((res, domain) => {
        // lang: domain_lang object, to list (but fiddle in the language...)
        // todo language should maybe be in the object (coming from the be)
        Object.entries(domain.langs).forEach(lang_domain => {
          res.push(Object.assign(lang_domain[1], {lang: lang_domain[0]}))
        })
        return res
      }, [])
    }
  },
  methods: {
    install_pwa() {
      install_pwa()
    },
    delete_languages() {
      console.log(this.messages_languages_value)
      console.log(this.$i18n)
      delete this.$i18n.messages[this.messages_languages_value.value[0]]
      this.$i18n.setLocaleMessage(this.messages_languages_value.value[0], null)
      this.persist_messages()
      //
    }
  }
}
</script>

<style scoped>

</style>
