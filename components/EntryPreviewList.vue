<template lang="pug">
    v-row(wrap justify-center)
      v-col(cols=12 v-for="entry in entries"
          :key="entry.id" class="col-sm-12 col-xs-6")
          Entrypreview(:entry="entry")
</template>

<script>
    import {mapGetters} from "vuex"
    import Entrypreview from "../components/EntryPreview";

    export default {
        name: "EntryPreviewList",
        components: {Entrypreview},
        props: {
            entries: Array,
        },
        created() {
        },
        data: function () {
            return {
                recent: {},
            }
        },
    }
</script>

<style scoped>
</style>
