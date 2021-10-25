<template lang="pug">
  .taglist
    <!-- use index for key since due to shortened text, there could be duplicates -->
    v-slide-group(v-if="slide" :show-arrows="true" class="custom-chip-group")
      span(v-for="(tag,index) in tag_list" :key="index")
        TagChip.mr-1(:tag="tag")
    div(v-else)
      div.mt-1(v-for="(tag, index) in tag_list" :key="index" :style="{display:'inline-block'}")
        TagChip(:tag="tag")
</template>

<script>
  import TagChip from "~/components/tag/TagChip"

  const summary_tag_thresh = 3
  const tag_text_cut_tresh = 45

  export default {
    name: "Taglist",
    components: {TagChip},
    props: {
      slide: Boolean,
      tags: {
        type: Object,
        default: () => {
        }
      },
      summarize: {
        type: Boolean
      }
    },
    computed: {
      tag_list() {
        let result = []
        for (let tag_type in this.tags) {
          if(this.summarize && this.tags[tag_type].length > summary_tag_thresh) {
            result.push({
              summary:true,
              text:`${tag_type}: ${this.tags[tag_type].length} ${this.$tc('comp.tags.tag',2)}`,
              hover: this.tags[tag_type]
          })
          } else {
            for (let tag of this.tags[tag_type]) {
              const tag_text = this.tag_text(tag)
              const res = {text: tag_text}
              if(tag.length > tag_text_cut_tresh)
                res.hover = tag
              result.push(res)
            }
          }
        }
        return result
      }
    },
    methods: {
      tag_text(tag_text) {
        if(tag_text.length > tag_text_cut_tresh) {
          return tag_text.substring(0,tag_text_cut_tresh - 2) + "..."
        } else
          return tag_text
      }
    }
  }
</script>

<style scoped>

  .taglist {
    max-width: 100%;
  }

  .custom-chip-group {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .custom-chip {
    cursor: default;
  }
</style>
