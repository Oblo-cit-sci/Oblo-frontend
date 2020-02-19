<template lang="pug">
  div(v-if="entry")
    v-row(justify-center align-center  v-if="!delete_entry && this.mode==='edit'")
      v-col(xs12 md12)
        Title_Description(
          :title="page_title"
          header_type="h1"
          :description="template.description"
          mode="edit")
        div(v-if="has_parent")
          span This entry is part of:&nbsp
          a(@click="to_parent(true, mode)") {{parent_title}}
        v-divider(class="wide_divider")
        div(v-if="has_pages")
          Title_Description(
            :title="page_info.title"
            header_type="h2"
            :description="page_info.description"
            mode="edit")
        br
        div(v-for="(aspect) in shown_aspects" :key="aspect.name")
          Aspect(
            :aspect="aspect"
            :aspect_loc="aspect_locs[aspect.name]"
            v-on:entryAction="entryAction($event)"
            :extra="aspect_extras"
            :mode="mode")
        div(v-if="page === 0")
          v-divider(class="wide_divider")
          Aspect(:aspect="license_aspect" :extra="aspect_extras" :mode="mode")
          <!--          License(:passedLicense.sync="entry.license" :mode="licence_mode")-->
          Privacy(:mode="privacy_mode" :passedPrivacy.sync="entry.privacy")
        v-col(v-if="last_page")
          MissingAspectsNotice(:entry="this.entry")
        EntryActions(
          v-bind="entry_actions_props"
          :page.sync="page"
          v-on:entryAction="entryAction($event)"
          v-on:edit="mode='edit'")
        DecisionDialog(
          :open.sync="openSaveDialog"
          @action="edit_or_save_dialog($event)"
          v-bind="unsaved_changes_dialog")
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
            v-on:entryAction="entryAction($event)"
            :mode="mode")
      v-col(v-if="show_image" cols=12 class="col-md-3 col-sm-12 entry-image")
        v-img(:src="entry_image()" aspect-ratio=1)
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

  import License from "../../../components/License"
  import Privacy from "../../../components/Privacy"

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
    ENTRIES_SAVE_ENTRY,
    ENTRIES_SET_EDIT,
    ENTRYTYPES_TYPE,
  } from "../../../lib/store_consts";
  import {get_aspect_vue_component} from "../../../lib/aspect"
  import EntryMixin from "../../../components/EntryMixin";
  import MetaChips from "../../../components/MetaChips"
  import {privacy_icon} from "../../../lib/util"
  import MissingAspectsNotice from "../../../components/MissingAspectsNotice";
  import TriggerSnackbarMixin from "../../../components/TriggerSnackbarMixin";
  import PersistentStorageMixin from "../../../components/PersistentStorageMixin";
  import FullEntryMixin from "../../../components/FullEntryMixin";
  import {license_aspect} from "../../../lib/typical_aspects";
  import EntryActorList from "../../../components/entry/EntryActorList";

  export default {
    name: "uuid",
    mixins: [EntryNavMixin, EntryMixin, TriggerSnackbarMixin, PersistentStorageMixin, FullEntryMixin],
    components: {
      MissingAspectsNotice,
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
      Privacy, License,
      MetaChips,
      EntryActorList
    },
    data() {
      return {
        required_values: [], // shortcut, but in template
        sending: false,
        complete: true,
        // todo abstact aspect-pagination
        aspect_extras: {},
        //
        router_next: null,
        // flag
        delete_entry: false,
        license_aspect: license_aspect(this.$store, ["cc_licenses"])
      }
    },
    created() {
      //console.log("entry index create", this.entry.values.)
      this.$store.dispatch(ENTRIES_SET_EDIT, this.uuid)
      let required_aspects = this.$_.filter(this.template.aspects, (a) => a.required || false)
      this.required_values = this.$_.map(required_aspects, (a) => {
        return a.name
      })
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
        this.$store.dispatch("entries/update_parent_version")
        this.aspect_extras["mark new aspects"] = true
        this.ok_snackbar("Updated")
      }
    },
    beforeRouteLeave(to, from, next) {
      // BEWARE, this is not called when navigating from one entry to another
      if (!this.delete_entry) {
        this.$store.dispatch(ENTRIES_SAVE_ENTRY)
      }
      this.persist_entries()
      next()
    },
    methods: {
      edit_or_save_dialog(event) {
        if (event.confirm) {
          this.$store.dispatch(ENTRIES_SAVE_ENTRY, this.uuid)
          this.router_next()
        } else {
          this.router_next = null
        }
      },
      check_complete() {
        for (let aspect_name of this.required_values) {
          let val = this.entry.values[aspect_name]
          //console.log("checking", aspect_name, val)
          if (val === null || val === "") {
            this.complete = false
            console.log("fail")
            return
          }
        }
        this.complete = true
      },
      // todo maybe kickout, since its also in Aspect
      /*aspect_id(aspect_name) {
          console.log("ASP_LOC STR", aspect_loc_str(this.aspect_locs[aspect_name]))
          return aspect_loc_str(this.aspect_locs[aspect_name])
      },*/
      // should actually be the whole ref string
      // TODO goes out for Aspect component
      aspectComponent(aspect) {
        return get_aspect_vue_component(aspect)
      },
      entryAction(action) {
        if (action === "delete") {
          this.delete_entry = true
        }
      }
    },
    computed: {
      aspect_loc() {
        return [EDIT, this.uuid, this.type_slug]
      },
      aspects() {
        return this.$store.getters[ENTRYTYPES_TYPE](this.template_slug).aspects
      },
      privacy_mode() {
        const privacy_set = this.template.rules.privacy
        return privacy_set ? VIEW : EDIT
      },
      licence_mode() {
        if (this.entry.refs.parent || this.entry.privacy === PRIVATE_LOCAL) {
          return VIEW
        } else {
          return EDIT
        }
      },
      dirty() {
        return this.entry.local.dirty || false
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
