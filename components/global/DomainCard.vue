<template lang="pug">
  v-card(class="mb-10" outlined :width="550" @click="goto_domain(domain)" :ripple="false")
    v-img(:src="domain_image" max-height="auto")
      v-chip.mt-2.ml-2(:style="{position:'absolute', opacity:'70%'}" color="info") English
      v-card-title(class="align-end fill-height shadow") {{domain.title}}
    v-card-text
      v-img.float-left.mr-3.mb-1(:src="domain_icon" left width="40" height="40")
      span {{domain.description}}
</template>

<script>
  // import {GET_DOMAIN_TEMPLATES_FETCHED, SET_DOMAIN, SET_TEMPLATES_CODES_FOR_DOMAIN} from "../store";

  export default {
    name: "DomainCard",
    props: {
      domain: {
        type: Object
      }
    },
    methods: {
      goto_domain(domain) {
        this.$router.push({path: "/domain", query: {d: domain.name}})
      },
    },
    computed: {
      domain_url() {
        return "domain/" + this.domain.value
      },
      domain_image() {
        return this.$api.static_url_$domain_name_banner(this.domain.name)
      },
      domain_icon() {
        return this.$api.static_url_$domain_name_icon(this.domain.name)
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
