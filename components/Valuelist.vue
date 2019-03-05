<template>
  <div>
    {{ct.title}}
    <v-list>
      <v-list-tile
        v-for="(value, i) in ct.values.slice(0, 5)"
        :key="value"
      >
        {{value}}: {{i}}
      </v-list-tile>
    </v-list>
  </div>
</template>

<script>
  export default {
    name: "Valuelist",
    props: {
      ct: Object
    }
  }
</script>

<style scoped>

</style>
