<template lang="pug">
    v-card(class="mb-10" outlined :width="550"  :to="domain_url" nuxt :ripple="false" @click.native="setDomain()")
        v-img(:src="'/app' + domain.img_src" max-height="auto")
            v-card-title(class="align-end fill-height shadow") {{domain.title}}
        v-card-text {{domain.description}}
</template>

<script>
    import {SET_DOMAIN} from "../lib/store_consts"
    export default {
        name: "DomainCard",
        props: {
            domain:{
                type: Object
            }
        },
        methods: {
            setDomain() {
                this.$store.commit(SET_DOMAIN, this.domain)
                //this.$localForage.setItem("domain", this.$store.state.domain, () => {})
            }
        },
        computed: {
            domain_url() {
                return "domain/" + this.domain.value
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
