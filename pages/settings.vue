<template lang="pug">
  div
    h1 Settings
    br
    h3 Export data
    div Export all your entries
    v-btn(@click="export_entries") Export
      v-icon.ml-2 mdi-export
    h3 Import data
    div Import data from a previously exported (downloaded) json file
    LoadFileButton(@fileload="load_file($event)" )
    br
    v-divider.wide-divider
    <!--    h3 Clear entries-->
    <!--    div delete all entries. Make sure that you made backups of the entries you made-->
    <!--    v-btn(@click="show_clear_entries" color="error") Clear-->
    DecisionDialog(
      v-bind="dialog_data"
      :open.sync="show_dialog"
      @action="dialog_action($event)")
</template>

<script>


  import Aspect from "../components/Aspect";
  import LoadFileButton from "../components/LoadFileButton";
  import DecisionDialog from "../components/DecisionDialog";
  import TextShort from "../components/aspects/TextShortAspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {export_data, merge_imported_entries} from "../lib/import_export";
  import PersistentStorageMixin from "../components/PersistentStorageMixin";
  import EntryPreviewList from "../components/EntryPreviewList";
  import {CLEAR_ENTRIES} from "../store";


  export default {
    name: "settings",
    components: {EntryPreviewList, TextShort, DecisionDialog, LoadFileButton, Aspect},
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin],
    created() {
    },
    data() {
      return {
        dialog_data: {
          id: ""
        },
        test_save_connect_loading: false,
        // todo move to json files
        clear_dialog_data: {
          id: "clear entries",
          title: "Are you sure you want to clear all entries? Did you make a backup via Export?",
          cancel_color: "",
          confirm_color: "error"
        },
        entries_imported_dialog: {
          id: "entries imported",
          title: "Entries imported",
          text: "",
          cancel_color: "",
          show_cancel: false
        },
        show_dialog: false,
        // temporary for hot fix
      }
    },
    methods: {
      export_entries() {
        const entries = Array.from(this.$store.state.entries.entries.values())
        export_data({entries: entries}, "all_entries.json")
      },
      show_clear_entries() {
        this.show_dialog = true
        this.dialog_data = this.clear_dialog_data
      },
      load_file(event) {
        if (event.ok) {

          // console.log(event.data.entries, typeof event.data.entries)
          let entries = event.data.entries
          // TODO TAKE CARE OF THE OLD FORMAT
          if (Array.isArray(event.data)) {
            entries = event.data
          } else if (!Array.isArray(event.data.entries)) {
            entries = Object.values(event.data.entries)
            console.log("trans", entries, typeof entries)
          }
          console.log("importing", entries.length)

          entries.forEach(entry => {
            entry.creation_datetime = new Date(entry.creation_datetime)
            entry.local = {
              dirty: false,
              prev: null,
            }
          })
          const result = merge_imported_entries(this.$store, entries)

          console.log("imported", result.length)
          // the following part will be usefull to display some results
          // const sorted = sort_by_type(result)
          // console.log("sorted", sorted)

          this.persist_entries()
          this.ok_snackbar("Entries imported")
        } else {
          this.error_snackbar("Something went wrong")
        }
      },
      dialog_action(event) {
        if (event.id === this.clear_dialog_data.id && event.confirm) {
          this.clear_entries()
        }
      },
      clear_entries() {
        this.$store.dispatch(CLEAR_ENTRIES)
        this.persist_entries()
        this.persist_draft_numbers()
      },
    },
    computed: {}
  }
</script>

<style scoped>

  .wide-divider {
    margin: 10px 0;
  }
</style>
