<template lang="pug">
  v-item-group.pb-2(v-model="selected")
    v-item.p-2.ml-1.mr-1.select_item(v-for="a in options" :key="a.name" v-slot:default="{ toggle }")
      v-card(@click="toggle" outlined)
        v-img.card_img(:src="get_icon_url(a.icon)")
        v-card-title {{a.name}}
        v-card-text.card_text {{a.description}}
</template>

<script>
  import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin"

  export default {
    name: "LargeSelectList",
    mixins: [SelectComponentMixin],
    props: {
      options: Array, // of objects: text, value, icon (url)
    },
    data() {
      return {
        selected: null,
      }
    },
    watch: {
      selected(value) {
        console.log("select", value)
        this.$emit("selection", this.options[value])
      }
    }
  }
</script>

<style scoped>

  .select_item {
    /*width: 98%;*/
    margin-bottom: 4px;
  }

  .card_img {
    margin: 1%;
    float: left;
    max-width: 120px;
  }

  .card_text {
    margin-top: 2%;
    clear: left;
  }
</style>
