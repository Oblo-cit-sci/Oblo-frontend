<template>
  <div>
    {{ct.title}}
    <v-list>
      <v-list-tile
        v-for="(code, value, index) in ct.options" v-if="index <= 5"
        :key="value"
      >
        {{value}}: {{code}}
      </v-list-tile>
    </v-list>
    <div roles="listitem" class="v-list__tile" v-if="Object.keys(ct.options).length > 5">...</div>
  </div>
</template>

<script>
  export default {
    name: "Codemap",
    props: {
      ct: Object
    }
  }
</script>

<style scoped>

</style>
