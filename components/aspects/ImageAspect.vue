<template lang="pug">
  div
    v-row
      v-col(v-for="(img_data, index) in images" :key="index" :cols="num_cols")
        v-img(:src="img_data.url" @click="open_image(index)")
          v-badge(v-if="cover_image_index===index" color="yellow" inline)
    LoadFileButton(label="Add image" filetype="image" @fileload="add_image($event)")
    v-dialog(v-model="image_open" overlay-opacity="100" fullscreen)
      ImageCard(:image_value="selected_img_data" v-if="image_open" @close="close")
      <!--      v-card(v-if="image_open")-->
      <!--        v-row.ma-2-->
      <!--          v-col(cols=1)-->
      <!--            v-btn(@click="close" icon)-->
      <!--              v-icon mdi-close-->
      <!--          v-col(cols=4 offset=3)-->
      <!--            Aspect(:aspect="aspects.title" :mode="edit")-->
      <!--            &lt;!&ndash;            span {{selected_img_data.title}}&ndash;&gt;-->
      <!--        v-row.ma-5-->
      <!--          v-img(:src="selected_img_data.url" contain max-height="500px")-->
      <!--        div.ma-1-->
      <!--          v-row-->
      <!--            v-col.font-weight-bold(v-if="selected_is_cover") Cover image-->
      <!--            v-col(v-else)-->
      <!--              v-btn(text @click="make_selected_cover" small) Make cover image-->
      <!--          v-row(v-for="(info, index) in additional_info" :key="index")-->
      <!--            v-col {{info}}-->
      <!--        v-row-->
      <!--          v-col-->
      <!--            v-btn(color="error") delete image-->
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import LoadFileButton from "../LoadFileButton";
  import Aspect from "../Aspect";
  import ImageCard from "../aspect_utils/ImageCard";
  import {ENTRIES_UPDATE_IMAGE} from "../../lib/store_consts";

  export default {
    name: "ImageAspect",
    components: {
      ImageCard,
      Aspect,
      LoadFileButton
    },
    mixins: [AspectMixin],
    data() {
      return {
        selected_image_index: -1,
        cover_image_index: -1,
      }
    },
    computed: {
      num_cols() {
        const bp = this.$vuetify.breakpoint
        if (bp.smAndDown)
          return 6
        else if (bp.mdOnly)
          return 4
        else if (bp.lgAndUp)
          return 3
        else {
          return 4
        }
      },
      image_open() {
        return this.selected_image_index !== -1
      },
      images() {
        return this.value
      },
      selected_img_data() {
        return this.images[this.selected_image_index]
      },
      selected_is_cover() {
        return this.selected_image_index === this.cover_image_index
      },
      // additional_info() {
      //   const i = this.selected_img_data
      //   return [
      //     i.description, i.license, i.date
      //   ]
      // }
    },
    methods: {
      add_image(image_result) {
        this.update_value(this.$_.concat(this.value, [{
          title: "nothing",
          description: "blabla",
          url: image_result.data,
          date: "10.10.2019",
          license: "No license"
        }]))
        if(this.value.length === 1) {
          this.set_cover_image(0)
        }
      },
      open_image(index) {
        this.selected_image_index = index
      },
      close() {
        this.selected_image_index = -1
      },
      set_cover_image(index) {
        this.cover_image_index = index
        this.$store.commit(ENTRIES_UPDATE_IMAGE, {
          uuid: this.entry_uuid,
          image_url: this.images[this.cover_image_index].url
        })
      },
      // todo needs to be called from the ImageCard component
      make_selected_cover(index = this.selected_image_index) {
        this.set_cover_image(index)
      }
    },
  }
</script>

<style scoped>

</style>
