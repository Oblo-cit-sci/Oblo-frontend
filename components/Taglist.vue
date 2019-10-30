<template lang="pug">
  div
    v-chip(v-for="tag in taglist" :key="tag.name"
      class="ma-2" outlined) {{tag.name}}
      v-icon.ml-2(v-if="tag.hasOwnProperty('icon')"
        size="16" light) {{tag.icon}}
</template>

<script>
    export default {
        name: "Taglist",
        props: {
            tags: {
                type: Object,
                default: () => {}
            }
        },
        data: function () {
            return {}
        },
        computed: {
            taglist() {
                let result = []
                for (let tag_type in this.tags) {
                    for (let tag of this.tags[tag_type]) {
                        result.push(tag)
                    }
                }
                return result
            }
        }
    }
</script>

<style scoped>

</style>
