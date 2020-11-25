<template lang="pug">
  DomainComponent.fullSize(:domain_data="domain_data")
</template>

<script>

import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import {QP_D, QP_F} from "~/lib/consts"
import DomainComponent from "~/components/page_components/DomainComponent";
import FixDomainMixin from "~/components/global/FixDomainMixin";

export default {
  name: "domain",
  mixins: [HasMainNavComponentMixin, FixDomainMixin],
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
    domain_data() {
      const language = this.$store.getters["user/settings"].domain_language
      const dd = this.$store.getters["domain/lang_domain_data"](this.domain_name, language)

      if(!dd) {

      } else {
        return dd
      }
    },
    domain_name() {
      return this.query_param_domain_name
    }
  },
  created() {
    if (this.is_prod) {
      window.history.replaceState(null, document.title, "/licci")
    }
    if (this.domain_name !== this.$store.getters["domain/act_domain_name"]) {
      this.$store.commit("domain/set_act_domain", this.domain_name)
    }

    if (this.$route.query.f && !this.is_fixed_domain) {
      this.fix_domain(this.$route.query.f)
    }
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
