<template lang="pug">
  Entry(:entry="entry")
</template>

<script>


// import EntryMixin from "../components/entry/EntryMixin";
import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
import {
  ENTRIES_GET_EDIT, ENTRIES_GET_ENTRY,
  ENTRIES_SET_EDIT,
} from "~/store/entries";
import Entry from "../components/entry/Entry";
import {EDIT, REVIEW, VIEW} from "~/lib/consts"

export default {
  name: "entry",
  mixins: [PersistentStorageMixin],
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
  },
  computed: {
    uuid() {
      return this.$route.query.uuid
    },
    entry() {
      if ([EDIT, REVIEW].includes(this.mode)) {
        return this.$store.getters[ENTRIES_GET_EDIT]()
      } else {
        return this.$store.getters[ENTRIES_GET_ENTRY](this.uuid)
      }
    },
    mode() {
      return this.$route.query.entry_mode || VIEW
    },
  }
}
</script>

<style scoped>

</style>
