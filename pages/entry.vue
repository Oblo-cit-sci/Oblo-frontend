<template lang="pug">
  Entry
</template>

<script>


  import EntryMixin from "../components/entry/EntryMixin";
  import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
  import {
    ENTRIES_SET_EDIT,
  } from "~/store/entries";
  import Entry from "../components/entry/Entry";

  export default {
    name: "entry",
    mixins: [EntryMixin, PersistentStorageMixin],
    components: {
      Entry
    },
    data() {
      return {}
    },
    created() {
      this.$store.dispatch(ENTRIES_SET_EDIT, this.uuid)
    },
    beforeRouteEnter(to, from, next) {
      // console.log("entry enter.. to", to)
      if (!to.query.uuid) {
        next(false)
      } else {
        next()
      }
    },
    mounted() {
      // if (this.$route.query.goTo) {
      //   setTimeout(() => {
      //     goTo("#" + this.$route.query.goTo, {
      //       duration: 1200,
      //       easing: "easeOutCubic"
      //     })
      //   }, 300)
      // }
      // if (this.outdated) {
      //   this.$store.dispatch(ENTRIES_UPDATE_PARENT_VERSION, this.uuid)
      //   this.ok_snackbar("Updated")
      // }
    },
    beforeRouteLeave(to, from, next) {
      // console.log("entry leave")
      // BEWARE, this is not called when navigating from one entry to another
      this.persist_entries()
      next()
    }
  }
</script>

<style scoped>

</style>
