<template lang="pug">
  v-card(class="mb-10" outlined :width="550" @click="goto_domain(domain)" :ripple="false")
    v-img(:src="domain_image" max-height="auto")
      v-card-title(class="align-end fill-height shadow") {{domain.title}}
    v-card-text {{domain.description}}
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
        // if(!this.$store.getters[GET_DOMAIN_TEMPLATES_FETCHED](domain.name)) {
        //   // console.log("templates not fetched")
        //   this.$api.domain__$domain_name__basic_entries(domain.name).then(({data}) => {
        //     // console.log("tempaltes fetch res", data)
        //     this.$store.dispatch(SET_TEMPLATES_CODES_FOR_DOMAIN, {
        //       domain_name: domain.name,
        //       entries: data.data
        //     })
        //       this.$store.commit(SET_DOMAIN, this.domain)
        //
        //   }).catch(err => {
        //     console.log("problems fetching domains")
        //     console.log(err)
        //   })
        // }
      },
    },
    computed: {
      domain_url() {
        return "domain/" + this.domain.value
      },
      domain_image() {
        return this.$api.static_url_$domain_name_banner(this.domain.name)
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
