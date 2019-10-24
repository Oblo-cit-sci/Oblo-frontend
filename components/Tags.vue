<template lang="pug">
  div(class="ml-4 mb-2")
    span(v-for="(item, index) in item_tags" :key="index" class="pr-4 text-truncate caption") # {{item}}
</template>

<script>

    export default {
        name: "Tags",
        props: {
            item_tags: {
                type: Array,
                default: () => ['tag1', 'tag2', 'tag3', 'tag4']
            }
        },
        data: function () {
            return {}
        }
    }
</script>

<style scoped>
</style>
