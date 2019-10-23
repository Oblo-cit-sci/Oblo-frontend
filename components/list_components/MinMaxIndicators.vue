<template lang="pug">
  div
    span {{count_text}}{{comma ? ", " : ""}} &nbsp
    span(v-if="requires") {{min}} required
    span(v-else)
      span(v-if="min") min: {{min}} &nbsp;
      span(v-if="max") max: {{max}}
</template>

<script>
    export default {
        name: "MinMaxIndicators",
        props: {
            min: Number,
            max: Number,
            aspect: {type: Object, required: true},
            length: {type: Number, required: true}
        },
        data() {
            return {}
        },
        created() {

        },
        computed: {
            requires() {
                return this.min !== null
            },
            comma() {
                return this.min !== null && this.min > 0
            },
            count_text() {
                const attr = this.aspect.attr
                const name = attr.itemname || "item"
                const item_word = this.length === 1 ? name :
                    (attr.itemname_plural || name + "s")
                return this.length + " " + item_word
            },
        },
        methods: {},
        watch: {}
    }
</script>

<style scoped>

</style>
