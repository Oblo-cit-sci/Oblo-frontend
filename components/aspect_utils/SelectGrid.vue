<template lang="pug">
  div
    v-container
      div.d-flex.flex-wrap
        .cell(v-for="(c, i) in options" :key="i" cols="1")
          v-row.mt-2.justify-center
            v-img.sel_cursor(:src="get_icon_url(c.icon)" width="80%"
              max-width="120px" max-height="120px" contain @click="select(c)" class="")
          v-row.mt-3.mb-2.justify-center
            div.sel_cursor(@click="select(c)") {{c.text}}
</template>

<script>
  import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin"

  export default {
    name: "SelectGrid",
    mixins: [SelectComponentMixin],
    components: {},
    props: {
      options: Array, // of objects: text, value, icon (url)
      default_image_url: String
    },
    data() {
      return {
        img_loaded: []
      }
    },
    created() {
      for (let i in this.options) {
        this.img_loaded.push(false)
      }
    },
    computed: {},
    methods: {
      select(value) {
        this.$emit("selection", value)
      },
    },
    watch: {}
  }
</script>

<style scoped>

  .cell {
    width: 200px;
    border: 1px grey solid;
    max-width: 160px;
    margin: 0 2px;
    margin-bottom: 2px;
  }

  .sel_cursor {
    cursor: pointer;
    white-space: normal;
    width: 160px;
    text-align: center;
    max-height: 80px;
  }
</style>
