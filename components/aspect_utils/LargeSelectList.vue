<template lang="pug">
  v-item-group.pb-2(v-model="selected")
    v-item.p-2.ml-1.mr-1.select_item(v-for="a in options" :key="a.name" v-slot:default="{ toggle }")
      v-card(@click="toggle" outlined)
        v-row
          v-col(cols=2 :style="img_col_style")
            v-img.card_img.ml-1(:src="get_icon_url(a.icon)" :style="img_style")
          v-col.ml-2(:style="text_col_style")
            h4 {{a.text}}
            div.card_text {{a.description}}
</template>

<script>
import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"

export default {
  name: "LargeSelectList",
  mixins: [SelectComponentMixin, ResponsivenessMixin],
  props: {
    options: Array, // of objects: text, value, icon (url)
  },
  data() {
    return {
      selected: null,
    }
  },
  computed: {
    img_col_style() {
      return {
        // "min-width": this.is_small? "width": "70px" :"120px"
        "min-width": this.img_width + "px",
      }
    },
    img_style() {
      return {
        "max-width": this.img_width + "px"
      }
    },
    img_width() {
      return this.is_xsmall ? 60 : this.is_small ? 80 : 120
    },
    text_col_style() {
      return {
        "font-size": this.is_xsmall ? "80%" : this.is_small ? "90%" : "100%"
      }
    }
  },
  watch: {
    selected(value) {
      // console.log("select", value)
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
}

.card_text {
  margin-top: 2%;
  clear: left;
}
</style>
