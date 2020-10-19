<template lang="pug">
  v-slide-group(v-if="slide" :show-arrows="true" class="custom-chip-group")
    v-chip(class="custom-chip" v-for="tag in tag_list" :key="tag" outlined @click="search(tag)") {{tag}}
  div(v-else)
    div(v-for="tag in tag_list" :key="tag")
      v-chip.mt-2(class="custom-chip" outlined) {{tag}}
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
      // search(tag) {
      //   console.log(tag)
      // }
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
