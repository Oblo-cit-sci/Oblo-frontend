<template lang="pug">
  v-list-item.my-2(:key="uuid")
    v-list-item-content
      v-list-item-title {{full_title}}
      v-list-item-subtitle.mt-2
        ActorChip(:actor="creator" :selectable="false")
</template>

<script>
  import EntryMixin from "~/components/entry/EntryMixin"
  import ActorChip from "~/components/actor/ActorChip"

  export default {
    name: "CompactEntry",
    mixins: [EntryMixin],
    components: {ActorChip},
    props: {
    },
    data() {
      return {}
    },
    computed: {
    },
    methods: {}
  }
</script>

<style scoped>

</style>
