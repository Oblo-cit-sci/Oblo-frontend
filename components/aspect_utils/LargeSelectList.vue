<template lang="pug">
  v-item-group.pb-2(v-model="selected")
    v-item.p-2.ml-1.mr-1.select_item(v-for="(item,i) in options" :key="item.name" v-slot:default="{ toggle }")
      v-card(@click="toggle" outlined :class="{cell_selected: is_selected(i)}")
        v-row
          v-col(v-if="has_icon(item)" cols=2 :style="img_col_style")
            v-img.card_img.ml-1( :src="get_icon_url(item.icon)" :style="img_style")
          v-col.ml-2(:style="text_col_style")
            h4 {{item.text}}
            div.card_text {{item.description}}
</template>

<script>
import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import SingleSelectMixin from "~/components/aspects/SingleSelectMixin"

export default {
  name: "LargeSelectList",
  mixins: [SelectComponentMixin, SingleSelectMixin, ResponsivenessMixin],
  props: {
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

.cell_selected {
  background: khaki;
}
</style>
