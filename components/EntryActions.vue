<template lang="pug">
  div
    v-divider(class="wide_divider")
    Paginate(
      v-if="has_pages"
      :page="page"
      @update:page="$emit('update:page', $event)"
      :total="entry_type.content.meta.pages.length"
      :named_pages="named_pages"
      :pages="entry_type.content.meta.pages"
      @lastpage="last_page = ($event)")
    span(v-if="owner")
      span(v-if="view")
        v-btn(color="secondary" @click="edit") edit
      span(v-else)
        v-btn(color="seconday" @click="show_cancel") cancel

      // TODO for the training we just DISABLE, otherwise it would be: :disabled="init"
      v-btn(color="warning" :disabled="initial_version" @click="show_delete") delete

      v-btn(:disabled="!dirty" color="success" @click="save") {{save_word}}
      v-btn(
        v-if="!private_local && !view && !in_context"
        color="success"
        @click="submit"
        :disabled="!connected"
        :loading="sending") {{submitted ? 'update' : 'submit'}}
      // v-if="private_local" todo for now, download for everyone
      v-btn(:disabled="disable_download"  @click="download") download
      v-btn(v-if="upload_option" @click="upload_to_repo") Upload to the repo
    DecisionDialog(v-bind="dialog_data" :open.sync="dialog_visible" v-on:action="dialog_action($event)")
</template>

<script>


    import {
        DRAFT,
        ENTRYACTION,
        PRIVATE_LOCAL,
        PUBLIC, SAVE,
        SUBMITTED,
        VIEW
    } from "../lib/consts";
    import Paginate from "./Paginate";
    import {current_user_is_owner, has_pages, save_entry} from "../lib/entry";

    import {export_data} from "../lib/client";
    import DecisionDialog from "./DecisionDialog";
    import EntryNavMixin from "./EntryNavMixin";

    import axios from "axios"
    import {ENTRIES_DELETE_ENTRY} from "../lib/store_consts";

    export default {
        name: "EntryActions",
        components: {DecisionDialog, Paginate},
        mixins: [EntryNavMixin],
        props: {
            mode: {
                type: String // view, create edit
            },
            entry_type: { // TODO maybe doesnt need to be the full thing
                type: Object
            },
            page: {
                type: Number
            },
            entry: {
                type: Object
            },
            dirty: {
                type: Boolean
            }
        },
        computed: {
            view() {
                return this.mode === VIEW
            },
            is_draft() {
                return this.entry.status === DRAFT
            },
            submitted() {
                return this.entry.status === SUBMITTED
            },
            private_local() {
                return (this.entry_type.content.meta.privacy || PUBLIC) === PRIVATE_LOCAL
            },
            connected() {
                return this.$store.state.connected
            },
            has_pages() {
                return has_pages(this.entry_type)
            },
            disable_download() {
                return this.has_pages && !this.last_page
            },
            owner() {
                return current_user_is_owner(this.$store, this.entry)
            },
            named_pages() {
                return this.entry_type.content.meta.hasOwnProperty("named_pages") || false
            },
            save_word() {
                if (this.in_context) {
                    return "save and back"
                } else if (this.private_local) {
                    return "save"
                } else {
                    return "save draft"
                }
            },
            upload_option() {
                return this.entry_type.content.activities.hasOwnProperty("upload")
            },
            initial_version() {
                return this.entry.version === 0
            }
        },
        data() {
            return {
                last_page: false,
                dialog_visible: false,
                delete_dialog_data: {
                    id: "delete",
                    title: "Delete entry",
                    text: "Are you sure you want to delete this entry?",
                    cancel_color: "",
                    confirm_color: "error",
                    confirm_text: "delete"
                },
                cancel_dialog_data: {
                    id: "cancel",
                    title: "Dismiss changes",
                    text: "Are you sure you want to dismiss your changes?",
                    cancel_color: "",
                    confirm_color: "error",
                    cancel_text: "keep on editing",
                    confirm_text: "dismiss"
                },
                dialog_data: {id: "none"},
                sending: false
            }
        },
        methods: {
            // BUTTONS
            upload_to_repo() {
                const url = this.entry_type.content.activities.upload.url
                const user_key = this.$store.getters.user_key

                if (!user_key) {
                    this.$store.commit("set_error_snackbar", "No user key. Go to the settings and paste the user key given by the LICCI core team")
                    return
                }
                const entries = this.$store.getters["entries/get_recursive_entries"](this.entry.uuid)
                let export_data = {entries: {...entries}, user_key: user_key}
                //console.log(url, user_key, export_data)
                axios.post(url, export_data, {
                    headers: {
                        "accept": "*",
                        "Access-Control-Allow-Headers": "accept",
                        'Access-Control-Allow-Origin': '*',
                    }
                }).then(res => {
                    this.$store.commit("set_status_snackbar", res.data)
                }).catch(err => {
                    console.log(err)
                    this.$store.commit("set_error_snackbar", "Something went horribly wrong")
                })
            },
            show_cancel() {
                if (this.dirty) {
                    this.show_dialog(this.cancel_dialog_data)
                } else {
                    if (this.entry.version === 0) {
                        this.delete_entry()
                    }
                    this.back(false)
                }
            },
            show_delete() {
                this.show_dialog(this.delete_dialog_data)
            },
            show_dialog(dialog_data) {
                this.dialog_data = dialog_data
                this.dialog_visible = true
            },
            dialog_action(event) {
                if (event.confirm) {
                    if (event.id === this.cancel_dialog_data.id) {
                        if(this.entry.version === 0) {
                            this.delete_entry()
                        }
                        this.back()
                    } else if (event.id === this.delete_dialog_data.id) {
                        this.delete_entry()
                    }
                }
            },
            delete_entry() {
                this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.entry.uuid)
                this.$store.commit("set_snackbar", {message: "Entry deleted", ok: true})
                this.back(false)
            },
            save() {
                // todo not if it is an aspect page
                //save_entry(this.$store, this.entry)
                this.$emit(ENTRYACTION, {action: SAVE})
                this.$store.commit("set_ok_snackbar", "Entry saved")
                this.back()
            },
            submit() {
                //console.log("entryAction submit")
                this.sending = true
                // would be the same as checking submitted
                if (this.entry.status === DRAFT) {
                    const all_entries = this.$_.concat([this.entry], this.$store.getters["entries/get_children"](this.entry))
                    this.$axios.post("/create_entry", all_entries).then((res) => {
                        this.sending = false
                        this.$store.commit("set_snackbar", {message: res.data.msg, ok: res.data.status})
                        this.entry.status = SUBMITTED
                        save_entry(this.$store, this.entry)
                        this.back()
                    }).catch((err) => {
                        console.log("error", err)
                    })
                } else {
                    this.$store.commit("set_error_snackbar", "not yet implemented")
                }
                this.sending = false
            },
            /*download_data() {
              return {
                entry: this.entry,
                name: this.entry_type.slug,
                version: this.entry_type.version,
                language: this.entry_type.language
              }*/
            download_title() {
                return (this.entry.type_slug + " " + this.entry.title).replace(" ", "_") + ".json"
            },
            download() {
                const entries = this.$store.getters["entries/get_recursive_entries"](this.entry.uuid)
                export_data(entries, this.download_title())
                this.$store.commit("entries/set_downloaded", this.entry.uuid)
            },
            lastpage_reached($event) {
                console.log("en action lastpage_reached", $event)
            },
            back(to_last_element = true) {
                this.$emit("update:dirty", false)
                this.to_parent(to_last_element)
            }
        }
    }

</script>

<style scoped>

</style>
