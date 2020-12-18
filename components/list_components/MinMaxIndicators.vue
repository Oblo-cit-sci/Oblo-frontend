<template lang="pug">
  div
    span {{count_text}}{{comma ? ", " : ""}} &nbsp
    span(v-if="requires") {{$t('comp.min_max_indicator.required',{number: min})}}
    span(v-else)
      span(v-if="min") {{$t('comp.min_max_indicator.min',{number: min})}}&nbsp;
      span(v-if="max") {{$t('comp.min_max_indicator.max',{number: max})}}
</template>

<script>
    import {item_count_name} from "~/lib/listaspects";

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
                return this.length + " " +  item_count_name(this.aspect, this.length)
            },
        },
        methods: {},
        watch: {}
    }
</script>

<style scoped>

</style>
