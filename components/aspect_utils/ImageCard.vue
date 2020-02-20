<template lang="pug">
  v-card()
    v-row.ma-2
      v-col(cols=1)
        v-btn(@click="$emit('close')" icon)
          v-icon mdi-close
      <!--      v-col(cols=4 offset=3)-->
      <!--        Aspect(:aspect="aspects.title" :mode="edit")-->
    v-row.ma-5
      v-img(:src="image_value.url" contain max-height="500px")
    div.ma-1
      v-row
        v-col.font-weight-bold(v-if="is_cover") Cover image
        v-col(v-else)
          v-btn(text @click="$emit('set_cover')" small) Make cover image
    <!--      v-row(v-for="(info, index) in additional_info" :key="index")-->
    <!--        v-col {{info}}-->
    v-row
      v-col
        v-btn(color="error") delete image
</template>

<script>
  import {dateAspectBuilder, shortTextAspectBuilder} from "../../lib/aspect";

  export default {
    name: "ImageCard",
    props: {
      image_value: {
        type: Object,
        required: true
      },
      is_cover: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return  {
        aspects: {
          title: shortTextAspectBuilder("Title"),
          date: dateAspectBuilder("Date")
        }
      }
    }
  }
</script>

<style scoped>

</style>
