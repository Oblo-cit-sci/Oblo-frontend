<template lang="pug">
  div(class="ml-4 mb-2")
    span(v-for="(item, index) in item_tags" :key="index" class="pr-4 text-truncate caption") # {{item}}
</template>
 
<script>

  export default {
    name: "Tags",
    data: function () {
      return {
        item_tags: [ 'tag1', 'tag2', 'tag3', 'tag4']
      }
      
    }
  }
</script>

<style scoped>
</style>
