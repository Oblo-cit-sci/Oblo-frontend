<template lang="pug">
  div
    v-row
      v-col(v-for="(img_data, index) in images" :key="index" cols=6 sm=4 md=6 lg=4 xl=3)
        v-img.a_image(:src="get_image_data(index)" @click="open_image(index)" max-height="300" contain @error="image_error($event, index)")
          .header_image_wrapper(v-if="cover_image_index===index && is_editable_mode")
            div.ml-9.font-weight-light {{$t('comp.image_asp.cover_image')}}
      v-col(v-if="is_view_mode && !has_images")
        div {{$t('comp.image_asp.no_images')}}
    LoadFileButton(v-if="is_editable_mode"
      :label="add_btn_label"
      filetype="image"
      :size_limit="max_image_size"
      @fileload="add_image($event)")
    v-dialog(v-model="image_open" overlay-opacity="100" fullscreen)
      ImageCard(
        v-if="image_open"
        :image_data="selected_img_data"
        :entry_uuid="entry_uuid()"
        :mode="mode"
        :is_cover="selected_is_cover"
        @set_cover="make_selected_cover"
        @close="close"
        @delete="delete_image(selected_image_index)")
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
import LoadFileButton from "../util/LoadFileButton";
import ImageCard from "../aspect_utils/ImageCard";
import AttachedFilesMixin from "../aspect_utils/AttachedFilesMixin";
import AspectComponentMixin from "./AspectComponentMixin";
import {DRAFT, EDIT, INDEX, META} from "~/lib/consts";
import {loc_append, remove_entry_loc} from "~/lib/aspect";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import {common_filesize} from "~/lib/util"

const uuidv4 = require('uuid/v4')

// because of get_entry it only works in entries now

export default {
  name: "ImageAspect",
  components: {
    ImageCard,
    LoadFileButton
  },
  mixins: [AspectComponentMixin, AttachedFilesMixin, TriggerSnackbarMixin],
  data() {
    return {
      selected_image_index: -1,
      cover_image_index: -1,
    }
  },
  computed: {
    image_open() {
      return this.selected_image_index !== -1
    },
    images() {
      return this.value
    },
    max_image_size() {
      return common_filesize(8, "MB")
    },
    selected_img_data() {
      return this.images[this.selected_image_index]
    },
    selected_is_cover() {
      return this.selected_image_index === this.cover_image_index
    },
    has_images() {
      return this.images.length
    },
    add_btn_label() {
      return this.$t("comp.image_asp.add_image", {item_name:"Image"})
    }
  },
  methods: {
    add_image(image_result) {
      // console.log("add", image_result)
      const file_uuid = uuidv4()
      this.$store.commit("files/add_file", {uuid: file_uuid, meta: image_result.meta, data: image_result.data})
      this.update_value(this.$_.concat(this.value, [{
        // title: "",
        // description: "",
        file_uuid: file_uuid,
        url: null,
        date: new Date(),
        // license: "No license",
        meta: image_result.meta
      }]))
    },
    image_error(error, index) {
      if (this.get_entry().status === DRAFT && this.is_editable_mode) {
        this.ok_snackbar(this.$t("comp.image_asp.not_found_draft"))
        if (this.images[index].file_uuid === this.get_entry().image) {
          this.$store.commit("entries/_set_entry_value", {
            aspect_loc: [[EDIT, ""], [META, "image"]]
          })
        }
      } else {
        console.log("err", error)
        this.error_snackbar(this.$t("comp.image_asp.not_found"))
      }
      this.delete_image(index)
    },
    open_image(index) {
      this.selected_image_index = index
    },
    close() {
      this.selected_image_index = -1
    },
    set_cover_image(index) {
      console.log(this.entry_uuid())
      this.cover_image_index = index
      console.log("set_cover_image", index, this.images.index)
      this.$store.commit("entries/update_image", this.images[index].file_uuid)
    },
    unset_cover_image() {
      this.cover_image_index = -1
      this.$store.commit("entries/update_image", null)
    },
    // todo needs to be called from the ImageCard component
    make_selected_cover(index = this.selected_image_index) {
      this.set_cover_image(index)
    },
    get_image_data(index) {
      if (this.images[index].url === null) {
        const img_data = this.$store.getters["files/get_file"](this.images[index].file_uuid)
        if (img_data) {
          return img_data.data
        } else {
          return this.$api.url_entry__$uuid__attachment__$file_uuid(this.entry_uuid(), (this.images[index].file_uuid))
        }
      } else {
        return this.images[index].url
      }
    },
    image_location(index) {
      return loc_append(remove_entry_loc(this.aspect_loc), INDEX, index)
    },
    delete_image(index) {
      if (this.is_editable_mode) {
        this.selected_image_index = -1
        const entry = this.get_entry()
        const entry_uuid = this.entry_uuid()
        const file_uuid = this.images[index].file_uuid
        // console.log(entry)

        const del_all = () => {
          this.update_value(this.$_.filter(this.value, (val, i) => {
            return index !== i
          }))
          if (this.cover_image_index === index) {
            this.unset_cover_image()
          }
          this.remove_file_attachment(entry_uuid, file_uuid)
        }
        if (entry) {
          if (entry.status === DRAFT) {
            del_all()
          } else {
            const file_uuid = this.value[index].file_uuid
            this.$api.delete_entry__$uuid__attachment__$file_uuid(this.entry_uuid(), file_uuid).then(resp => {
              del_all()
            }).catch(err => {
            })
          }
        }
      }
    }
  },
  watch: {
    mode: {
      immediate: true,
      handler() {
        const entry_image = this.$store.getters["entries/get_entry"](this.entry_uuid()).image
        if (entry_image) {
          this.cover_image_index = this.images.findIndex(img => img.file_uuid === entry_image)
        }
      }
    },
    images(new_val, prev_val) {
      if (this.is_editable_mode) {
        // image added
        if (new_val.length > prev_val.length) {
          const new_img_index = this.images.length - 1
          if (new_img_index === 0) {
            this.set_cover_image(0)
          }
          this.add_file_attachment(null, "image",
            this.images[new_img_index].file_uuid, this.image_location(new_img_index))
        }
      }
    }
  }
}
</script>

<style scoped>

.a_image {
  cursor: zoom-in;
}

.header_image_wrapper {
  height: 20px;
  width: 100%;
  background: rgba(255, 255, 0, 0.75);
}
</style>
