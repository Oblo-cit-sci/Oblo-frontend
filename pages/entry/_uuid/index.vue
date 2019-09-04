<template lang="pug">
  v-layout(justify-center align-center)
    v-flex(xs12 md12)
      Title_Description(
        :title="entry_type.title"
        header_type="h1"
        :description="entry_type.description"
        mode="edit")
      div(v-if="entry.refs.parent")
        span This entry is part of:&nbsp
        a(@click="to_parent") {{parent_title}}
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
          v-bind:value="entry.aspects_values[aspect.name]"
          v-on:update:value="update_value(aspect, $event)"
          v-on:entryAction="entryAction($event)"
          mode="edit"
          :extra="extras[aspect.name]"
          :extra_update="extras_update[aspect.name]")
      div(v-if="page === 0")
        v-divider(class="wide_divider")
        License(:passedLicense.sync="entry.license" :mode="licence_mode")
        Privacy(:mode="privacy_mode" :passedPrivacy.sync="entry.privacy")
      EntryActions(
        v-bind="entry_actions_props"
        :page.sync="page"
        :dirty.sync="dirty"
        :has_pages="has_pages"
        @entryAction="entryAction($event)")
      DecisionDialog(
        :open.sync="openSaveDialog"
        @action="edit_or_save_dialog($event)"
        id="unsaved_changes"
        title="Unsaved changes"
        text="You have unsaved changes"
        cancel_text="Keep on editing"
        confirm_text="Save and move on")
</template>

<script>


  import License from "../../../components/License"
  import Privacy from "../../../components/Privacy"

  import {
    autosave,
    create_and_store,
    MAspectComponent,
    get_TitleAspect,
    save_entry
  } from "../../../lib/entry"
  import Title_Description from "../../../components/Title_Description"
  import EntryActions from "../../../components/EntryActions";
  import {
    EDIT,
    AUTOSAVE,
    CREATE_CONTEXT_ENTRY,
    GLOBAL_ASPECT_REF,
    ASPECT, DELETE_CONTEXT_ENTRY, PRIVATE_LOCAL, VIEW, SAVE
  } from "../../../lib/consts";
  import Aspect from "../../../components/Aspect";

  import goTo from 'vuetify/lib/components/Vuetify/goTo'
  import {check_conditions, resolve_aspect_ref} from "../../../lib/client";
  import {has_pages} from "../../../lib/entry";
  import EntryNavMixin from "../../../components/EntryNavMixin";
  import DecisionDialog from "../../../components/DecisionDialog";
  import {unpack} from "../../../lib/aspect";
  import {ENTRIES_ADD_CHILD, ENTRIES_DELETE_ENTRY, ENTRIES_SET_ENTRY_VALUE} from "../../../lib/store_consts";


  export default {
    name: "uuid",
    mixins: [EntryNavMixin],
    components: {
      DecisionDialog,
      Aspect,
      EntryActions,
      Title_Description,
      Privacy, License
    },
    data() {
      return {
        entry: null,
        entry_type: null, // the full shizzle for the type_slug
        titleAspect: null,
        required_values: [], // shortcut, but in entry_type
        sending: false,
        complete: true,
        has_pages: false,
        page: this.$route.query.page | 0,
        last_page: false,
        extras: {},
        extras_update: {},
        //
        dirty: false,
        openSaveDialog: false,
        route_destination: null
      }
    },
    created() {

      this.uuid = this.$route.params.uuid
      const entry = this.$store.getters["entries/get_entry"](this.uuid)

      this.entry = JSON.parse(JSON.stringify(entry))

      this.$store.commit("set_global_ref", this.uuid)

      if (this.$route.query.hasOwnProperty("dirty")) {
        this.dirty = true
      }
      // set global ref, needed for deeply nested maps to know how to come back
      //this.$store.commit("set_global_ref", {uuid: this.uuid})

      this.entry_type = this.$store.getters.entry_type(this.entry.type_slug)
      this.titleAspect = get_TitleAspect(this.entry_type)
      this.has_pages = has_pages(this.entry_type)

      let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
      this.required_values = this.$_.map(required_aspects, (a) => {
        return a.name
      })

      this.conditions = check_conditions(this.entry_type)
      let condition_targets = this.$_.map(this.conditions, c => c.aspect)

      // todo same in page EntryType
      for (let aspect of this.entry_type.content.aspects) {
        let extra_props = {}
        extra_props.aspect_loc = [[ASPECT, aspect.name]]
        if (condition_targets.indexOf(aspect.name)) {
          extra_props.condition = {
            value: null
          }
        }
        this.extras[aspect.name] = extra_props
        this.extras_update[aspect.name] = false
      }
      /* set aspect refs:
          when an attribute has #
          this doesnt belong here, especially cuz of the duplicate for edit/_local_id page
      * */
      for (let aspect of this.entry_type.content.aspects) {
        let value = resolve_aspect_ref(this.$store, this.entry, aspect)
        if (value !== undefined) {
          console.log("uuid.index value", value)
          this.entry.aspects_values[aspect.name].value = value
          //value_ref = aspect_loc_str2arr(aspect.attr.value)
        }
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
    },
    methods: {
      entryAction(event) {
        //console.log("entry action")
        const action = event.action
        const value = event.value
        switch (action) {
          case AUTOSAVE:
            this.dirty = false
            autosave(this.$store, this.entry)
            break
          case GLOBAL_ASPECT_REF:
            this.$store.commit("add_aspect_loc", value)
            break
          // todo maybe the server could set the titleAspect and itself
          // would in that case emit up this actiovaluen
          // otherwise, now its unused, cuz the titleAspect is grabbed here
          case SAVE:
            this.dirty = false
            save_entry(this.$store, this.entry)
            break
          case CREATE_CONTEXT_ENTRY:
            this.create_ref(value)
            break
          case DELETE_CONTEXT_ENTRY:
            this.delete_child(value)
            break
          default:
            console.log("unknown entry action", action, value, "event:", event)
            break
        }
      },
      check_complete() {
        for (let aspect_name of this.required_values) {
          let val = this.entry.aspects_values[aspect_name]
          //console.log("checking", aspect_name, val)
          if (val === null || val === "") {
            this.complete = false
            console.log("fail")
            return
          }
        }
        this.complete = true
      },
      update_value(aspect, value) {
        //console.log("index update value", aspect.name, value.value)
        if (aspect.name === this.titleAspect) {
          this.entry.title = unpack(value)
        }
        if (this.conditions.hasOwnProperty(aspect.name)) {
          for (let aspect of this.conditions[aspect.name]) {
            this.extras_update[aspect] = !this.extras_update[aspect]
            this.extras[aspect].condition.value = unpack(value)
          }
        }
        this.entry.aspects_values[aspect.name] = value
        this.dirty = true
      },
      // should actually be the whole ref string
      // TODO goes out for Aspect component
      aspectComponent(aspect) {
        return MAspectComponent(aspect)
      },
      // TODO obviously this needs to be refatored
      // can be passed down to aspect. it only needs the entry_id passed down
      create_ref({type_slug, aspect_loc}) {
        let parent_ref_data = {
          uuid: this.uuid,
          aspect_loc: aspect_loc,
        }
        autosave(this.$store, this.entry)
        const entry = create_and_store(type_slug, this.$store, parent_ref_data)

        this.$store.dispatch(ENTRIES_ADD_CHILD, {
          uuid: this.entry.uuid,
          aspect_loc: aspect_loc,
          child_uuid: entry.uuid,
          value: entry.uuid
        })

        this.$router.push({
          path: "/entry/" + entry.uuid
        })
      },
      delete_child(ref) {
        this.$store.dispatch(ENTRIES_DELETE_ENTRY, ref.uuid)
        delete this.entry.refs.children[ref.uuid]
        autosave(this.$store, this.entry)
      },
      // todo bring back
      /*check_conditions(event) {
          //console.log(this.extras)
          //console.log("UVALL", event, Object.keys(this.conditions).indexOf(event.aspect) > -1)
          if (Object.keys(this.conditions).indexOf(event.aspect) > -1) {
            console.log(this.conditions[event.aspect], this.conditions)
            const target = this.conditions[event.aspect]
            //this.extras[this.conditions[event.aspect]]["condition"] = {}
            //this.extras[this.conditions[event.aspect]]["condition"][event.aspect] = event.value
            this.condition_vals[target] = {val: event.value}
          }
        }*/
      edit_or_save_dialog(event) {
        if (event.confirm) {
          autosave(this.$store, this.entry)
          // TODO this should be everywhere, or managed by autosave
          this.dirty = false
          this.$router.push(this.route_destination.fullPath)
        }
      }
    },
    beforeRouteLeave(to, from, next) {
      //console.log("route leave")
      if (this.dirty) {
        next(false)
        this.openSaveDialog = true
        this.route_destination = to
      } else {
        next()
      }
    },
    computed: {
      privacy_mode() {
        const privacy_set = this.entry_type.content.meta.privacy
        return privacy_set ? VIEW : EDIT
      },
      licence_mode() {
        if (this.entry.refs.parent || this.entry.privacy === PRIVATE_LOCAL) {
          return VIEW
        } else {
          return EDIT
        }
      },
      parent_title() {
        // todo not necessarily available for remote entries. should be included?
        return this.$store.getters["entries/get_entry"](this.entry.refs.parent.uuid).title
      },
      shown_aspects() {
        if (this.has_pages) {
          return this.$_.filter(this.entry_type.content.aspects, (a) => {
            return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
              (this.page > 0 && a.attr.page === this.page))
          })
        }
        return this.entry_type.content.aspects
      },
      // maybe also consider:
      // https://github.com/edisdev/download-json-data/blob/develop/src/components/Download.vue
      page_info() {
        //console.log(this.entry_type, this.page, this.entry_type.content.meta.pages[this.page])
        if (this.has_pages)
          return this.entry_type.content.meta.pages[this.page]
        else
          return null
      },
      // wrong, create should be for all that are not local/saved or submitted
      entry_actions_props() {
        return {
          mode: EDIT,
          entry_type: this.entry_type,
          entry: this.entry
        }
      }
    },
    watch: {
      page(val) {
        setTimeout(() => goTo(".v-content"), {
          duration: 200,
          easing: "easeOutCubic"
        })
      }
    }
  }
</script>

<style scoped>

</style>
