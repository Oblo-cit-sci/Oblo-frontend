<template lang="pug">
  v-card(class="mb-10" outlined :width="550" @click="goto_domain" :ripple="false")
    v-img(:src="image" max-height="auto")
      v-chip.mt-2.ml-2(
        v-for="lang_tag in domain_language_tags"
        :key="lang_tag"
        :style="{position:'absolute', opacity:'70%'}" color="info") {{lang_tag}}
      v-card-title(class="align-end fill-height shadow") {{title}}
    v-card-text
      v-img.float-left.mr-3.mb-1(:src="icon" left width="40" height="40")
      span {{description}}
</template>

<script>
  // import {GET_DOMAIN_TEMPLATES_FETCHED, SET_DOMAIN, SET_TEMPLATES_CODES_FOR_DOMAIN} from "../store";

  import DomainMixin from "~/components/DomainMixin"
  import {PAGE_DOMAIN} from "~/lib/pages"

  export default {
    name: "DomainCard",
    mixins: [DomainMixin],
    props: {},
    methods: {
      goto_domain() {
        this.$router.push({name: PAGE_DOMAIN, query: {d: this.domain_name}})
      },
    },
    computed: {
      title() {
        return this.domain_data.title
      },
      description() {
        return this.domain_data.description
      },
      image() {
        return this.$api.static_url_$domain_name_banner(this.domain_name)
      },
      icon() {
        return this.$api.static_url_$domain_name_icon(this.domain_name)
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
