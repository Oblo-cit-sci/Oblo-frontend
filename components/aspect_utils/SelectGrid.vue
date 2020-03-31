<template lang="pug">
    div
        v-container
            div.d-flex.flex-wrap
                .cell(v-for="(c, i) in options" :key="i" cols="1")
                    v-row.mt-2.justify-center
                        v-img.sel_cursor(src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg" width="80%"
                            max-width="150px" max-height="150px" contain @click="select(c)" class="")
                    v-row.mt-3.mb-1.justify-center
                        div.sel_cursor(@click="select(c)") {{c.text}}
</template>

<script>
    export default {
        name: "SelectGrid",
        mixins: [],
        components: {},
        props: {
            options: Array, // of objects: text, value, icon (url)
            default_image_url: String
        },
        data() {
            return {}
        },
        created() {

        },
        computed: {},
        methods: {
            select(value) {
                this.$emit("selection", value)
            }
        },
        watch: {}
    }
</script>

<style scoped>

    .cell {
        width: 200px;
        border: 1px grey solid;
        max-width: 160px;
        margin: 0 2px;
    }

    .sel_cursor {
        cursor: pointer;
        white-space: normal;
        width: 160px;
        text-align: center;
        height: 80px;
    }
</style>
