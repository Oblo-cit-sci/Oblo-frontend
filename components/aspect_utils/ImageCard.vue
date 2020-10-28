<template lang="pug">
  v-card()
    v-row.ma-2
      v-col(cols=1)
        v-btn(@click="$emit('close')" icon)
          v-icon mdi-close
      <!--      v-col(cols=4 offset=3)-->
      <!--        Aspect(:aspect="aspects.title" :mode="edit")-->
    v-row.ma-5
      v-img(:src="get_image_data()" contain max-height="500px")
    div.ma-1(v-if="mode==='edit'")
      v-row
        v-col.font-weight-bold(v-if="is_cover") Cover image
        v-col(v-else)
          v-btn(text @click="$emit('set_cover')" small) Make cover image
      v-row
        v-col
          v-btn(color="error" @click="$emit('delete')") delete image
    <!--      v-row(v-for="(info, index) in additional_info" :key="index")-->
    <!--        v-col {{info}}-->
    <!--    v-row-->

</template>

<script>
    import {dateAspectBuilder, shortTextAspectBuilder} from "../../lib/aspect";


    export default {
        name: "ImageCard",
        props: {
            image_data: {
                type: Object,
                required: true
            },
            is_cover: {
                type: Boolean,
                required: true
            },
            entry_uuid: String,
            mode: String
        },
        data() {
            return {
                aspects: {
                    title: shortTextAspectBuilder("Title"),
                    date: dateAspectBuilder("Date")
                }
            }
        },
        methods: {
            // todo move this to a mixin or lib function. similar to ImageAspect
            get_image_data() {
                if (this.image_data.url === null) {
                    const img_data = this.$store.getters["files/get_file"](this.image_data.file_uuid)
                    if (img_data) {
                        return img_data.data
                    } else {
                        return this.$api.url_entry__$uuid__attachment__$file_uuid(this.entry_uuid, (this.image_data.file_uuid))
                    }
                } else {
                    return this.image_data.url
                }
            },
        }
    }
</script>

<style scoped>

</style>
