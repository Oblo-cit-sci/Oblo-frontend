<template lang="pug">
  v-card(outlined :width="550"  :to="to" nuxt :ripple="false")
    v-img(:src="img_src" max-height="200")
      v-card-title(class="align-end fill-height") {{title}}
    v-card-text {{text}}
</template>

<script>
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
        methods: {},
        watch: {}
    }
</script>

<style scoped>

</style>
