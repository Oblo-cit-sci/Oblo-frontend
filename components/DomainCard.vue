<template lang="pug">
    v-card(class="mb-10" outlined :width="550" @click="goto_domain(domain)" :ripple="false")
        v-img(:src="domain_image" max-height="auto")
            v-card-title(class="align-end fill-height shadow") {{domain.title}}
        v-card-text {{domain.description}}
</template>

<script>
    import {SET_DOMAIN} from "../lib/store_consts"
    import {static_file_path} from "../lib/util";
    export default {
        name: "DomainCard",
        props: {
            domain:{
                type: Object
            }
        },
        methods: {
            goto_domain(domain) {
                this.$store.commit(SET_DOMAIN, this.domain)
                this.$router.push("/domain/" + domain.value)
            },
        },
        computed: {
            domain_url() {
                return "domain/" + this.domain.value
            },
            domain_image() {
                return static_file_path(this.$store, this.domain.img_src)
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
