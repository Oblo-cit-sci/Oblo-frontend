<template lang="pug">
  div
    h1 Settings
    br
    div(v-if="partner_settings")
      h3 User key: Upload to the LICCI Repo (temporary option)
      div During the main data collection period of LICCI partners, partners can upload collected data to the LICCI data repository. AUTOMATICALLY SAVED
      TextShort(
        :aspect="user_key_aspect"
        :ext_value="user_key"
        mode="edit"
        v-on:update_value="update_user_key($event)")
      v-btn(@click="test_save" :loading="test_save_connect_loading") Test and save
      br
      v-divider.wide-divider
    h3 Export data
    div Export all your entries
    v-btn(@click="export_entries") Export
      v-icon.ml-2 mdi-export
    h3 Import data
    div Import data from a previously exported (downloaded) json file
    LoadFileButton(@fileload="load_file($event)" )
    br
    v-divider.wide-divider
    h3 Clear entries
    div delete all entries. Make sure that you made backups of the entries you made
    v-btn(@click="show_clear_entries" color="error") Clear
    DecisionDialog(
      v-bind="dialog_data"
      :open.sync="show_dialog"
      @action="dialog_action($event)")
    <!--    VDialog(v-bind="dialog_content")-->
    <!--    v-card-->
    v-btn(@click="fix_entries") fix entries
    v-btn(@click="load_etypes") load entry types, just 6.17 for now
</template>

<script>


    import Aspect from "../components/Aspect";
    import {pack_value} from "../lib/aspect";
    import LoadFileButton from "../components/LoadFileButton";
    import DecisionDialog from "../components/DecisionDialog";
    import TextShort from "../components/aspects/TextShortAspect";
    import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
    import {export_data, merge_imported_entries} from "../lib/import_export";
    import {ENTRIES_ALL_ENTRIES_ARRAY, USER_KEY} from "../lib/store_consts";
    import {get_release_mode} from "../lib/util";
    import {LICCI_PARTNERS} from "../lib/consts";
    import PersistentStorageMixin from "../components/PersistentStorageMixin";
    import {
        check_all_values_basic_sanity,
        find_orhpans, fix_0_16_multi_select_errors,
        fix_add_licci_domain,
        fix_check_entrylist_references
    } from "../lib/fixes";

    export default {
        name: "settings",
        components: {TextShort, DecisionDialog, LoadFileButton, Aspect},
        mixins: [TriggerSnackbarMixin, PersistentStorageMixin],
        created() {
            find_orhpans(this.$store)

            fix_0_16_multi_select_errors(this.$store)

              // const orphans = this.$_.filter(this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY](), e => e.status === "orphan")
            // const entries = this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]()
            // const sanity_cheks = check_all_values_basic_sanity(entries)

            // fix_broken_aspect_value_structure(this.$store)

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
                user_key_aspect: {
                    name: "User key",
                    description: "For that purpose, in order to identify each partner, you need to paste your user key here, which you received from the LICCI core team",
                    type: "str",
                    attr: {
                        max: 40
                    }
                },
                show_dialog: false
            }
        },
        methods: {
            test_save() {
                this.test_save_connect_loading = true
                let data = {user_key: this.$store.state.meta.repository.user_key}
                this.$axios.post("https://licci.uab.cat/cgi-bin/test_user.py", data, {
                    headers: {
                        "accept": "*",
                        "Access-Control-Allow-Headers": "accept",
                        'Access-Control-Allow-Origin': '*',
                    }
                }).then(res => {
                    // TODO the whole thing is not super elegant. stored in vuex on key, but in browser only on save...
                    this.snackbar(res.data.status, res.data.msg)
                    this.test_save_connect_loading = false
                    if (res.data.status) {
                        this.persist_user_key()
                        this.$router.push("/")
                    }
                }).catch(err => {
                    console.log(err)
                    this.test_save_connect_loading = false
                    this.error_snackbar("Something went horribly wrong")
                })
            },
            export_entries() {
                const entries = Array.from(this.$store.state.entries.entries.values())
                export_data({entries: entries}, "all_entries.json")
            },
            show_clear_entries() {
                this.show_dialog = true
                this.dialog_data = this.clear_dialog_data
            },
            update_user_key(event) {
                this.$store.commit("add_meta", {
                    repository: {
                        user_key: event.value
                    }
                })
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
                this.$store.dispatch("clear_entries")
                this.persist_entries()
                this.persist_draft_numbers()
            },
            fix_entries() {
                fix_add_licci_domain(this.$store)
                try {
                    fix_check_entrylist_references(this.$store)
                } catch (e) {
                    console.log(e)
                }
            },
            load_etypes() {
                const etypes = require("../lib/data_backups/v.0.6.17")
                this.$store.commit("entrytypes/set_types", etypes)
                // console.log(etypes)
            }
        },
        computed: {
            user_key() {
                return pack_value(this.$store.getters[USER_KEY])
            },
            partner_settings() {
                return get_release_mode(this.$store) === LICCI_PARTNERS
            },
            dialog_content() {
                return ""
            }
        }
    }
</script>

<style scoped>

  .wide-divider {
    margin: 10px 0;
  }
</style>
