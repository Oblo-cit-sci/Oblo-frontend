<template lang="pug">
  div(v-if="entry")
    div(v-if="!delete_entry && this.mode==='edit'")
      EntryEdit
    v-row(justify-center align-center v-else-if="this.mode==='view'")
      v-col(cols=12)
        Title_Description(
          :title="page_title"
          header_type="h1"
          :description="template.description")
        div(v-if="has_parent")
          span This entry is part of:&nbsp
          a(@click="to_parent(true, mode)") {{parent_title}}
        div
          MetaChips(:meta_aspects="meta_aspects_privacy")
          EntryActorList.mt-2(:actors="actors")
        v-divider(class="wide_divider")
      v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-9' : 'col-md-12']")
        div(v-if="has_pages")
          Title_Description(
            :title="page_info.title"
            header_type="h2"
            :description="page_info.description")
        br
        div(v-for="(aspect) in shown_aspects" :key="aspect.name")
          Aspect(
            :aspect="aspect"
            :aspect_loc="aspect_locs[aspect.name]"
            :mode="mode")
      v-col(v-if="show_image" cols=12 class="col-md-3 col-sm-12 entry-image")
        v-img(:src="entry_image" aspect-ratio=1)
      v-col(class="entry-meta" cols=12)
        EntryActions(
          v-bind="entry_actions_props"
          :page.sync="page"
          :passed_uuid="uuid"
          v-on:entryAction="entryAction($event)"
          v-on:edit="mode='edit'")
        DecisionDialog(
          :open.sync="openSaveDialog"
          @action="edit_or_save_dialog($event)"
          v-bind="unsaved_changes_dialog")
</template>

<script>


  import Title_Description from "../../../components/Title_Description"
  import EntryActions from "../../../components/EntryActions";
  import {
    EDIT, PRIVATE_LOCAL, VIEW
  } from "../../../lib/consts";
  import Aspect from "../../../components/Aspect";

  import goTo from 'vuetify/lib/services/goto'
  import EntryNavMixin from "../../../components/EntryNavMixin";
  import DecisionDialog from "../../../components/DecisionDialog";
  import {
    ENTRYTYPES_TYPE,
  } from "../../../lib/store_consts";
  import EntryMixin from "../../../components/EntryMixin";
  import MetaChips from "../../../components/MetaChips"
  import {privacy_icon} from "../../../lib/util"
  import TriggerSnackbarMixin from "../../../components/TriggerSnackbarMixin";
  import PersistentStorageMixin from "../../../components/PersistentStorageMixin";
  import FullEntryMixin from "../../../components/FullEntryMixin";
  import {entry_roles_aspect, license_aspect, privacy_aspect} from "../../../lib/typical_aspects";
  import EntryActorList from "../../../components/entry/EntryActorList";
  import {
    ENTRIES_GET_EDIT, ENTRIES_GET_ENTRY,
    ENTRIES_SET_EDIT, ENTRIES_UPDATE_ENTRY,
    ENTRIES_UPDATE_PARENT_VERSION
  } from "../../../store/entries";
  import EntryEdit from "../../../components/EntryEdit";

  export default {
    name: "uuid",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      EntryEdit,
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
      MetaChips,
      EntryActorList
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
      privacy_aspect() {
        return privacy_aspect(this.$store)
      },
      entry_roles_aspect() {
        return entry_roles_aspect(this.$store)
      },
      aspects() {
        return this.$store.getters[ENTRYTYPES_TYPE](this.template_slug).aspects
      },
      licence_mode() {
        if (this.entry.refs.parent || this.entry.privacy === PRIVATE_LOCAL) {
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
      // wrong, create should be for all that are not local/saved or published
      meta_aspects_privacy() {
        let result = []
        result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
        result.push({name: "License: " + this.entry.license})
        return result
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
