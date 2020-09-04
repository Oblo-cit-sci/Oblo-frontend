<template lang="pug">
  v-card(class="mb-10" outlined :width="550" @click="goto_domain" :ripple="false")
    v-img(:src="image" max-height="auto")
      v-hover(v-for="lang_tag in languages"
        :key="lang_tag")
        v-chip.mt-2.ml-2(:style="{opacity:'70%'}" :color="hover ? 'yellow' :'info'" slot-scope="{ hover }") {{lang_tag}}
      v-card-title(class="align-end fill-height shadow") {{title}}
    v-card-text
      v-img.float-left.mr-3.mb-1(:src="icon" left width="40" height="40")
      span {{description}}
</template>

<script>
// import {GET_DOMAIN_TEMPLATES_FETCHED, SET_DOMAIN, SET_TEMPLATES_CODES_FOR_DOMAIN} from "../store";

import {PAGE_DOMAIN} from "~/lib/pages"
import DomainDataMixin from "~/components/domain/DomainDataMixin"

export default {
  name: "DomainCard",
  mixins: [DomainDataMixin],
  props: {
    languages: Array
  },
  methods: {
    goto_domain() {
      this.$router.push({name: PAGE_DOMAIN, query: {d: this.domain_name}})
    },
  }
}
</script>

<style scoped>
.shadow {
  text-shadow: 3px 3px 2px black;
  color: whitesmoke;
}
</style>
