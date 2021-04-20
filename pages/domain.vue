<template lang="pug">
  DomainComponent.fullSize(v-if="has_domain_name" :domain_data="domain_data")
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
  beforeRouteEnter(to, from, next) {
    if (!(to.query[QP_D] || to.query[QP_F])) {
      // todo somehow doesn't load...
      next("/")
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
      if (!this.has_domain_name)
        return null
      // TODO DOMAIN LANGUAGE?
      const language = this.$store.getters["user/settings"].domain_language
      return this.$store.getters["domain/lang_domain_data"](this.domain_name, language)
    }
  },
  created() {
    if (this.is_prod) {
      window.history.replaceState(null, document.title, "/licci")
    }
    if (this.domain_name !== this.$store.getters["domain/act_domain_name"]) {
      this.$store.dispatch("domain/set_act_domain_lang",
        {
          domain_name: this.domain_name,
          language: this.$store.getters["ui_language"]
        })
    }
    if (this.$route.query.f && !this.is_fixed_domain) {
      this.fix_domain(this.$route.query.f)
    }

    this.show_guidelines()
  },
  beforeRouteLeave(from, to, next) {
    if (this.is_prod) {
      window.history.replaceState(null, document.title, this.$route.fullPath)
    }
    this.set_menu_open(false)
    next()
  },
}
</script>

<style scoped>

.fullSize {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
