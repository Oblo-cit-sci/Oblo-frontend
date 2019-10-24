<template lang="pug">
    v-card(class="mb-10" outlined :width="550"  :to="to" nuxt :ripple="false" @click.native="setDomain()")
        v-img(:src="img_src" max-height="auto")
            v-card-title(class="align-end fill-height shadow") {{title}}
        v-card-text {{text}}
</template>

<script>
    import {SET_DOMAIN} from "../lib/store_consts"
    export default {
        name: "DomainCard",
        props: {
            title: {
                type: String,
                required: true
            },
            to: {
                type: String,
                required: true
            },
            img_src: {
                type: String
            },
            text: {
              type: String
            }
        },
        data() {
            return {}
        },
        created() {

        },
        computed: {},
        methods: {
            setDomain() {
                this.$store.commit(SET_DOMAIN,this.title)              
            }
        },
        watch: {}
    }
</script>

<style scoped>
   .shadow {
       text-shadow: 3px 3px 2px black; 
       color: whitesmoke;
   }
</style>
