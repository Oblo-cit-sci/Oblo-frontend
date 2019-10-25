<template lang="pug">
  div
    v-chip(v-for="tag in item_tags" :key="tag.name"
     class="ma-2" outlined) {{tag.name}}
      v-icon.ml-2(v-if="tag.hasOwnProperty('icon')" 
      size="16" light) {{tag.icon}} 
</template>

<script>
  export default {
    name: "Taglist",
    props: {
      item_tags: {
          type: Array,
          default: () => [{
            name: 'tag1',
            icon:'mdi-sprout-outline'
            },{
            name: 'tag2',
            },{
            name: 'tag3',
            icon:'mdi-sprout-outline'
            },{
            name: 'tag4',
            }]
      }
    },
    data: function () {
        return {}
    }
  }
</script>

<style scoped>

</style>
