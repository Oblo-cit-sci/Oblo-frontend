<template lang="pug">
  div
    v-chip(v-for="(item, index) in meta_items" :key="index" 
      :ripple="false"
      small
      class="mr-2 mb-2"
      label)
      v-avatar
        v-icon(small) {{item.icon}}
      p(class="ma-0" ) {{item.name}}
</template>

<script>

  export default {
    name: "MetaChips",
    data: function () {
      return {
        meta_items: [ 
          {title: 'type', name:'Landrace'},
          {icon: 'public', title: 'license', name:'Public'},
          {icon: 'fa-archive', title: 'privacy'},
          {icon: 'fa fa-user', title: 'user', name: 'Visitor'},
        ]
      }
      
    }
  }
</script>

<style scoped>
  .secondary_descr {
    font-size: 85%;
    padding-left: 1%;
    padding-right: 5%;
  }

</style>
