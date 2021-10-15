<template lang="pug">
  div
    v-text-field(v-if="is_editable_mode"  v-model="value" @input="delayed_check")
    div(v-if="is_valid")
      iframe(v-if="is_youtube" width="560" height="315"
        :src="src"
        title="YouTube video player" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen)
      iframe(v-if="is_vimeo" :src="src" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen)
    div(v-else)
      div EN: not a valid video url (copy a url from youtube or vimeo)
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"

const YOUTUBE = "youtube"
const VIMEO = "vimeo"

export default {
  name: "VideoAspect",
  mixins: [AspectComponentMixin],
  components: {},
  props: {},
  data() {
    return {
      video_exists: false,
      i_value: null
    }
  },
  created() {
    this.delayed_check = this.$_.debounce(this.check_input, 1000)
    if (this.value) {
      this.check_input()
    }
  },
  computed: {
    source_page() {
      if (this.i_value) {
        if (this.i_value.startsWith("https://www.youtube.com")) {
          return YOUTUBE
        }
        if (this.i_value.startsWith("https://vimeo.com")) {
          return VIMEO
        } else
          return null
      }
    },
    is_youtube() {
      return this.source_page === YOUTUBE
    },
    is_vimeo() {
      return this.source_page === VIMEO
    },
    src() {
      if (this.is_youtube) {
        const video_code = new URL(this.i_value).searchParams.get('v')
        return `https://www.youtube.com/embed/${video_code}`
      } else if(this.is_vimeo){
        const video_code = new URL(this.i_value).pathname.substring(1)
        return `https://player.vimeo.com/video/${video_code}`
      } else {
        return null
      }
    },
    is_valid() {
      try {
        new URL(this.i_value)
        if(!this.source_page) {
          return false
        }
        return this.video_exists
      } catch (e) {
        return false
      }
    }
  },
  methods: {
    delayed_check() {
      this.check_input()
    },
    check_input() {
      this.i_value = this.value
      // cannot check it?!
      this.video_exists = true
      // console.log("checking", this.value)
      // this.$axios.options(this.value, {
      //   headers: {
      //     "Access-Control-Allow-Origin": "https://www.youtube.com",
      //     'Access-Control-Allow-Methods': 'GET,OPTIONS'
      //   },
      //   withCredentials: true
      // }).then(res => {
      //   // console.log(res)
      //   this.check_good = true
      // }, err => {
      //   console.log("invalid video")
      //   this.check_good = false
      // })
    }
  }
}
</script>

<style scoped>

</style>
