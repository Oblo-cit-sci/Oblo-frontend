<template lang="pug">
  DomainComponent.fullSize(v-if="domain_data" :domain_data="domain_data")
</template>

<script>

import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import {QP_D, QP_F} from "~/lib/consts"
import DomainComponent from "~/components/page_components/DomainComponent";
import FixDomainMixin from "~/components/global/FixDomainMixin";
import GuidelinesMixin from "~/components/GuidelinesMixin";

export default {
  name: "domain",
  mixins: [HasMainNavComponentMixin, FixDomainMixin, GuidelinesMixin],
  components: {DomainComponent},
  head() {
    // seems to work in production?!
    return {
      link: [
        {rel: 'icon', type: 'image/x-icon', href: this.$api.static.domain_icon(this.domain_name)}
      ]
    }
  },
  beforeRouteEnter(to, from, next) {
    if (!(to.query[QP_D] || to.query[QP_F])) {
      // console.log(to, from, next)
      // todo somehow doesn't load...
      next({path: '/'})
    } else {
      next()
    }
  },
  computed: {
    // this is false for a short bit when logging out
    // console.log(this.$route.fullPath) is actually /logout, some async stuff...
    domain_name() {
      return this.query_param_domain_name
    },
    has_domain_name() {
      return !!this.domain_name
    },
    domain_data() {
      // console.log("DD data...", this.has_domain_name)
      if (!this.has_domain_name)
        return null
      // console.log(this.$store.getters["domain/act_lang_domain_data"])
      return this.$store.getters["domain/act_lang_domain_data"]
      // const language = this.$store.getters["user/settings"].domain_language
      // return this.$store.getters["domain/lang_domain_data"](this.domain_name, language)
    }
  },
  created() {
    // change the url for fixed pages to just /:domain_name
    if (this.is_prod && this.$route.query[QP_F] === this.domain_name) {
      window.history.replaceState(null, document.title, `${this.domain_name}`)
    }
    if (this.domain_name !== this.$store.getters["domain/act_domain_name"]) {
      this.$store.dispatch("domain/set_act_domain_lang",
        {
          domain_name: this.domain_name,
          language: this.$store.getters.domain_language
        })
    }
    if (this.$route.query[QP_F] && !this.is_fixed_domain) {
      this.fix_domain(this.$route.query[QP_F])
    }

    this.$nuxt.$options.head.title = this.domain_data?.title
    this.show_guidelines()
    // this was the only reliable way to consistently change (and keep) the window title
  },
  mounted() {
    // changing the this didnt work
    const dynamicFavicon = (favicon) => {
      const link = document.createElement("link")
      link.rel = "shortcut icon"
      link.type = "image/png"
      link.href = favicon
      document.head.appendChild(link)
    }
    dynamicFavicon(this.$api.static.domain_icon(this.domain_name))
  },
  beforeRouteLeave(from, to, next) {
    if (this.is_prod) {
      window.history.replaceState(null, document.title, this.$route.fullPath)
    }
    this.set_menu_open(false)
    next()
  }
}
</script>

<style scoped>

.fullSize {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
