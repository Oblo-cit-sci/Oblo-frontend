<template lang="pug">
  div
    v-row
      v-col(v-for="(img_data, index) in images" :key="index" :cols="num_cols")
        v-img(:src="get_image_data(index)" @click="open_image(index)")
          v-badge(v-if="cover_image_index===index" color="yellow" inline)
    LoadFileButton(label="Add image" filetype="image" @fileload="add_image($event)")
    v-dialog(v-model="image_open" overlay-opacity="100" fullscreen)
      ImageCard(
        v-if="image_open"
        :image_value="selected_img_data"
        :is_cover="selected_is_cover"
        @set_cover="make_selected_cover"
        @close="close")
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
  import LoadFileButton from "../LoadFileButton";
  import Aspect from "../Aspect";
  import ImageCard from "../aspect_utils/ImageCard";
  import {ENTRIES_UPDATE_IMAGE} from "../../lib/store_consts";
  import AttachedFilesMixin from "../aspect_utils/AttachedFilesMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import {loc_append, loc_remove_first} from "../../lib/aspect";
  import {INDEX} from "../../lib/consts";
  const uuidv4 = require('uuid/v4')

  export default {
    name: "ImageAspect",
    components: {
      ImageCard,
      Aspect,
      LoadFileButton
    },
    mixins: [AspectComponentMixin, AttachedFilesMixin],
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
      }
    },
    methods: {
      add_image(image_result) {
        console.log("add", image_result)
        const file_uuid = uuidv4()
        this.$store.commit("files/add_file", {uuid: file_uuid, meta: image_result.meta, data: image_result.data})
        this.update_value(this.$_.concat(this.value, [{
          title: "",
          description: "",
          uuid: file_uuid,
          url: null,
          date: new Date(),
          license: "No license",
          meta: image_result.meta
        }]))
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
          uuid: this.entry_uuid(),
          image_url: this.images[index].uuid
        })
      },
      // todo needs to be called from the ImageCard component
      make_selected_cover(index = this.selected_image_index) {
        this.set_cover_image(index)
      },
      get_image_data(index) {
        if(this.images[index].url === null) {
          return this.$store.getters["files/get_file"](this.images[index].uuid).data
        } else {
          return this.images[index].url
        }
      },
    },
    watch: {
      images(new_val, prev_val) {
        // image added
        if(new_val.length > prev_val.length) {
          const new_img_index = this.images.length - 1
          if (new_img_index === 0) {
            this.set_cover_image(0)
          }
          this.add_file_attachment(this.entry_uuid(), "image", this.images[new_img_index].uuid)
        }
      }
    }
  }
</script>

<style scoped>

</style>
