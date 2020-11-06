<template lang="pug">
  .taglist
    v-slide-group(v-if="slide" :show-arrows="true" class="custom-chip-group")
      v-chip.mr-1(class="custom-chip" v-for="tag in tag_list" :key="tag" outlined) {{tag}}
    div(v-else)
      v-chip.mt-1.mr-1(v-for="tag in tag_list" :key="tag" class="custom-chip" outlined) {{tag}}
</template>

<script>
  export default {
    name: "Taglist",
    props: {
      slide: Boolean,
      tags: {
        type: Object,
        default: () => {
        }
      },
      summarize: {
        type: Boolean
      }
    },
    data: function () {
      return {}
    },
    computed: {
      tag_list() {
        let result = []
        for (let tag_type in this.tags) {
          if(this.summarize && this.tags[tag_type].length > 3) {
            result.push(`${tag_type}: ${this.tags[tag_type].length} tags`)
          } else {
            for (let tag of this.tags[tag_type]) {
              result.push(tag)
            }
          }
        }
        return result
      }
    },
    methods: {
    }
  }
</script>

<style scoped>

  .taglist {
    max-width: 100%;
  }

  .custom-chip-group {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .custom-chip {
    cursor: default;
  }
</style>
