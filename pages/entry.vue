<template lang="pug">
  div(v-if="entry && !delete_entry")
    Entry
</template>

<script>


  import {EDIT, PRIVATE_LOCAL, VIEW} from "~/lib/consts";

  import goTo from 'vuetify/lib/services/goto'
  import EntryNavMixin from "../components/EntryNavMixin";
  import EntryMixin from "../components/entry/EntryMixin";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
  import FullEntryMixin from "../components/entry/FullEntryMixin";
  import {entry_roles_aspect} from "~/lib/typical_aspects";
  import {
    ENTRIES_GET_EDIT,
    ENTRIES_SET_EDIT,
    ENTRIES_UPDATE_ENTRY,
    ENTRIES_UPDATE_PARENT_VERSION
  } from "~/store/entries";
  import Entry from "../components/entry/Entry";
  import {TEMPLATES_TYPE} from "~/store/templates";

  export default {
    name: "entry",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      Entry
    },
    data() {
      return {
        entry_complete: false,
        aspect_extras: {},
        router_next: null,
        delete_entry: false
      }
    },
    created() {
      this.$store.dispatch(ENTRIES_SET_EDIT, this.uuid)
    },
    beforeRouteEnter(to, from, next) {
      console.log("entry enter.. to", to)
      if(!to.query.uuid) {
        next(false)
      } else {
        next()
      }
    },
    mounted() {
      if (this.$route.query.goTo) {
        setTimeout(() => {
          goTo("#" + this.$route.query.goTo, {
            duration: 1200,
            easing: "easeOutCubic"
          })
        }, 300)
      }
      if (this.outdated) {
        this.$store.dispatch(ENTRIES_UPDATE_PARENT_VERSION, this.uuid)
        this.ok_snackbar("Updated")
      }
    },
    beforeRouteLeave(to, from, next) {
      console.log("entry leave")
      // BEWARE, this is not called when navigating from one entry to another
      this.persist_entries()
      next()
    },
    methods: {
      edit_or_save_dialog(event) {
        if (event.confirm) {
          this.$store.dispatch(ENTRIES_UPDATE_ENTRY, this.uuid)
          this.router_next()
        } else {
          this.router_next = null
        }
      },
      entryAction(action) {
        if (action === "delete") {
          this.delete_entry = true
        }
      }
    },
    computed: {
      entry() {
        return this.$store.getters[ENTRIES_GET_EDIT]()
      },
      aspect_loc() {
        return [EDIT, this.uuid]
      },
      is_first_page() {
        return this.page === 0
      },
      license_aspect() {
        return license_aspect(this.$store, ["cc_licenses"], [])
      },
      entry_roles_aspect() {
        return entry_roles_aspect(this.$store)
      },
      aspects() {
        return this.$store.getters[TEMPLATES_TYPE](this.template_slug).aspects
      },
      licence_mode() {
        if (this.entry.entry_refs.parent || this.entry.privacy === PRIVATE_LOCAL) {
          return VIEW
        } else {
          return EDIT
        }
      },
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      page_info() {
        //console.log(this.template, this.page, this.template.rules.pages[this.page])
        if (this.has_pages)
          return this.template.rules.pages[this.page]
        else
          return null
      },
      show_image() {
        return this.entry.image
      }
    },
    watch: {
      page(value) {
        let res = Object.assign({}, this.$route.query)
        res = Object.assign(res, {page: value})
        this.$router.replace({query: res})
        setTimeout(() => goTo(".v-content"), {
          duration: 200,
          easing: "easeOutCubic"
        })
      }
    }
  }
</script>

<style scoped>
  .entry-image {
    max-width: 300px;
  }

  @media (max-width: 959px) {
    .entry-meta {
      order: 1
    }

    .entry-image {
      max-width: 300px;
    }
  }


</style>
