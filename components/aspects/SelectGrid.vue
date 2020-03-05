<template lang="pug">
  div
    v-container
      div.d-flex.flex-wrap
        .cell(v-for="(c, i) in items" :key="i" cols="1")
          v-row.mt-2.justify-center
            v-img.sel_cursor(src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg" width="80%"
              max-width="150px" max-height="150px" contain @click="select(i)" class="")
          v-row.mt-3.mb-1.justify-center
            div.sel_cursor(@click="select(i)") {{c}}
</template>

<script>
  export default {
    name: "SelectGrid",
    mixins: [],
    components: {},
    props: {},
    data() {
      return {
        rows: 2
      }
    },
    created() {

    },
    computed: {
      items() {
        return ["hello", "nein", "doch", "ok"]
      }
    },
    methods: {
      select(index) {
        console.log(index)
      }
    },
    watch: {}
  }
</script>

<style scoped>

  .cell {
    width: 200px;
    border: 1px grey solid;
    max-width: 160px;
  }

  .sel_cursor {
    cursor: pointer;
  }
</style>
