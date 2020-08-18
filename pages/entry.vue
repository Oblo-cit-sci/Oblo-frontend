<template lang="pug">
  Entry(:entry="entry" :mode="mode")
</template>

<script>


import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
import {
  ENTRIES_GET_EDIT, ENTRIES_GET_ENTRY,
  ENTRIES_SET_EDIT,
} from "~/store/entries";
import Entry from "../components/entry/Entry";
import {VIEW} from "~/lib/consts"

// todo, use mapgetters with entries context
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
    // todo some in case we want edit in main page, it wouldnt be set to edit yet, cuz this is the only place edit is set...
    if(!this.$store.getters["entries/has_full_entry"](this.uuid)) {
      // actually should be home or back. but we should always have it...
      this.$router.push("/")
    }
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
      return this.$store.getters[ENTRIES_GET_EDIT]()
      // if ([EDIT, REVIEW].includes(this.mode)) {
      //   return this.$store.getters[ENTRIES_GET_EDIT]()
      // } else {
      //   return this.$store.getters[ENTRIES_GET_ENTRY](this.uuid)
      // }
    },
    mode() {
      return this.$route.query.entry_mode || VIEW
    },
    is_dirty() {
      if (this.is_draft || this.mode === VIEW) {
        return false
      }
      const edit_entry = this.$_.omit(this.$store.getters[ENTRIES_GET_EDIT](), ["local"])
      const original_entry = this.$_.omit(this.$store.getters[ENTRIES_GET_ENTRY](this.uuid), ["local"])
      return !this.$_.isEqual(edit_entry, original_entry)
    },
  }
}
</script>

<style scoped>

</style>
