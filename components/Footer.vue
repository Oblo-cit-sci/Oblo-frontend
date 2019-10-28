<template lang="pug">
    v-footer.justify-content-center.custom-footer(dark
      padless
      absolute
      elevation=4)
      v-row(no-gutters)
        v-col(cols="12" md="10").pa-2
            span(v-for="item in footer_data" :key="item.item")
                a(:href="item.link" target="_blank") link
        v-col(cols="12" md="2").pa-2 
            a.privacy-policy() {{privacy.title}}
</template>

<script>

    export default {
        name: "Footer",
        data() {
            return {
                privacy: {
                    title: 'Privacy Policy'
                },
                footer_data: [
                    {
                        logo: 'images/uab-logo.png',
                        link: 'https://www.uab.cat/web/universitat-autonoma-de-barcelona-1345467954774.html'
                    }
                ]
            }
        }
    }
</script>

<style scoped>
    .custom-footer {
        border-top: 1px solid lightgray;
        background-color: white;
        color: black;
    }
    .privacy-policy {
        font-size: 10px
    }
</style>
