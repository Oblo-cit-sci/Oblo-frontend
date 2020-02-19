<template lang="pug">
    v-slide-group(show-arrows=true class="custom-chip-group")
        v-chip(class="custom-chip" v-for="tag in tag_list" :key="tag" outlined) {{tag}}
            <!--            v-icon.ml-2(v-if="tag.hasOwnProperty('icon')"-->
            <!--                size="16" light) {{tag.icon}}-->
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
            tag_list() {
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
    .custom-chip-group {
        margin-top: 15px;
        margin-bottom: 15px;
    }
    .custom-chip {
        cursor: default;
        margin-right: 10px;
    }
</style>
