<template lang="pug">
  div
    v-textarea("outline" :label="aspect.name"  v-model="i_value" @input="value_change($event)")
</template>

<script>
    import AspectMixin from "./AspectMixin";

    export default {
        mixins: [AspectMixin],
        name: "TextLong"
    }
</script>

<style scoped>

</style>
