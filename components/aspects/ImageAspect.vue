<template lang="pug">
  div
    v-row
      v-col(v-for="(img_data, index) in images" :key="index" :cols="num_cols")
        v-img(:src="img_data.url" @click="open_image(index)")
          v-badge(v-if="cover_image_index===index" color="yellow" inline)
    v-row
      v-btn(@click="add_image") Add image
    v-dialog(v-model="image_open" overlay-opacity="100" fullscreen)
      v-card(v-if="image_open")
        v-row.ma-2
          v-col
            v-btn(@click="close" icon)
              v-icon mdi-close
          v-col
            span {{selected_img_data.title}}
        v-row.ma-5
          v-img(:src="selected_img_data.url" contain max-height="500px")
        div.ma-1
          v-row
            v-col.font-weight-bold(v-if="selected_is_cover") Cover image
            v-col(v-else)
              v-btn(text @click="make_selected_cover" small) Make cover image
          v-row(v-for="(info, index) in additional_info" :key="index")
            v-col {{info}}
        v-row
          v-col
            v-btn(color="error") delete image
</template>

<script>
    import AspectMixin from "./AspectMixin";

    export default {
        name: "ImageAspect",
        mixins: [AspectMixin],
        components: {},
        props: {},
        data() {
            return {
                fake_data: [],
                selected_image_index: -1,
                cover_image_index: 0
            }
        },
        created() {
            for (let i in [...Array(8).keys()]) {
                this.fake_data[i] = {
                    title: "nothing",
                    description: "blabla",
                    url: "https://picsum.photos/500/300?image=" + (i * 5 + 10),
                    date: "10.10.2019",
                    license: "No license"
                }
            }
            console.log(this.fake_data)
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
                return this.fake_data
            },
            selected_img_data() {
                return this.images[this.selected_image_index]
            },
            selected_is_cover() {
                return this.selected_image_index === this.cover_image_index
            },
            additional_info() {
                const i = this.selected_img_data
                return [
                    i.description, i.license, i.date
                ]
            }
        },
        methods: {
            add_image() {

            },
            open_image(index) {
                this.selected_image_index = index
            },
            close() {
                this.selected_image_index = -1
            },
            set_cover_image(index) {
                this.cover_image_index = index
                console.log(this.entry)
            },
            make_selected_cover() {
                this.set_cover_image(this.selected_image_index)
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
