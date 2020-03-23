<template lang="pug">
  div
    v-row
      v-col(v-for="(img_data, index) in images" :key="index" :cols="num_cols")
        v-img(:src="get_image_data(index)" @click="open_image(index)" max-height="300" contain)
          v-badge(v-if="cover_image_index===index" color="yellow" inline)
    LoadFileButton(label="Add image" filetype="image" @fileload="add_image($event)")
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
  import LoadFileButton from "../LoadFileButton";
  import Aspect from "../Aspect";
  import ImageCard from "../aspect_utils/ImageCard";
  import AttachedFilesMixin from "../aspect_utils/AttachedFilesMixin";
  import AspectComponentMixin from "./AspectComponentMixin";
  import {DRAFT, INDEX} from "../../lib/consts";
  import {loc_append, remove_entry_loc} from "../../lib/aspect";
  import {FILES_ADD_FILE, FILES_GET_FILE} from "../../store/files";
  import {ENTRIES_GET_ENTRY, ENTRIES_UPDATE_IMAGE} from "../../store/entries";

  const uuidv4 = require('uuid/v4')

  // because of get_entry it only works in entries now

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
    created() {
      // todo this, should be more direct for EntryAspectMixin (future)
      const entry_image = this.$store.getters[ENTRIES_GET_ENTRY](this.entry_uuid()).image
      if(entry_image) {
        this.cover_image_index = this.images.findIndex(img => img.file_uuid === entry_image)
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
        // console.log("add", image_result)
        const file_uuid = uuidv4()
        this.$store.commit(FILES_ADD_FILE, {uuid: file_uuid, meta: image_result.meta, data: image_result.data})
        this.update_value(this.$_.concat(this.value, [{
          title: "",
          description: "",
          file_uuid: file_uuid,
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
        this.$store.commit(ENTRIES_UPDATE_IMAGE, this.images[index].file_uuid)
      },
      unset_cover_image() {
        this.cover_image_index = -1
        this.$store.commit(ENTRIES_UPDATE_IMAGE,  null)
      },
      // todo needs to be called from the ImageCard component
      make_selected_cover(index = this.selected_image_index) {
        this.set_cover_image(index)
      },
      get_image_data(index) {
        if (this.images[index].url === null) {
          const img_data = this.$store.getters[FILES_GET_FILE](this.images[index].file_uuid)
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
        this.selected_image_index = -1
        const entry = this.get_entry()
        const entry_uuid = this.entry_uuid()
        const file_uuid = this.images[index].file_uuid
        // console.log(entry)

        const del_all = ()  => {
          this.update_value(this.$_.filter(this.value, (val, i) => {
            return index !== i
          }))
          if(this.cover_image_index === index) {
            this.unset_cover_image()
          }
          this.remove_file_attachment(entry_uuid, file_uuid)
        }

        if(entry) {
          if(entry.status === DRAFT) {
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
    },
    watch: {
      images(new_val, prev_val) {
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
</script>

<style scoped>

</style>
