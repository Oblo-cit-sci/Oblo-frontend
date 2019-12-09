<template lang="pug">
  v-layout(justify-center)
    v-flex(xs12 md8)
      SingleSelect(
        v-if="type_select"
        :options="options"
        force_view="list"
        @selection="selection($event)"
        :select_sync="false"
        :highlight="false"
        :create="true")
      div(v-if="entry_notes")
        Title_Description(
          :title="page_title"
          header_type="h1"
          :description="entry_type.description"
          mode="edit")
        v-divider(class="wide_divider")
        div(v-for="(aspect,index) in shown_aspects" :key="aspect.key")
          AspectDescription(:aspect="aspect" :loc="aspect_descr_loc(aspect)")
        v-divider(class="wide_divider")
        Paginate(
          v-if="has_pages"
          :page="page"
          @update:page="page = $event"
          :total="entry_type.content.meta.pages.length"
          :named_pages="named_pages"
          :pages="entry_type.content.meta.pages"
          @lastpage="more_follow_page = ($event)")
        v-btn(@click="download") download
          v-icon.ml-2 mdi-download
        LoadFileButton(@fileload="import_data($event)")
</template>

<script>

    import SingleSelect from "../components/SingleSelect";
    import AspectDescription from "../components/AspectDescription";
    import {ENTRYTYPES_TYPE, ENTRYTYPES_TYPE_NOTES, ENTRYTYPES_TYPES} from "../lib/store_consts";
    import PersistentStorageMixin from "../components/PersistentStorageMixin";
    import {export_data} from "../lib/import_export";
    import LoadFileButton from "../components/LoadFileButton";
    import Paginate from "../components/Paginate";
    import Title_Description from "../components/Title_Description";
    import EntrytypePageMixin from "../components/EntrytypePageMixin";
    import goTo from 'vuetify/lib/services/goto'
    import mapGetters from 'vuex'

    const TYPE_SELECT = "type_select"
    const ENTRY_NOTES = "entry_notes"

    export default {
        name: "EntrytypeNotes",
        mixins: [PersistentStorageMixin, EntrytypePageMixin],
        components: {Title_Description, Paginate, LoadFileButton, AspectDescription, SingleSelect},
        props: {},
        data() {
            return {
                state: TYPE_SELECT,
                selectec_type: null
            }
        },
        created() {

        },
        beforeRouteLeave(to, from, next) {
            this.persist_notes()
            next()
        },
        computed: {
            /*...mapGetters({"f_type_notes": ENTRYTYPES_TYPE_NOTES}),
            type_notes() {
                return this.f_type_notes(this.slug)
            },*/
            options() {
                return this.$_.map(this.$store.getters[ENTRYTYPES_TYPES], o => {
                    return {
                        text: o.title,
                        value: o.slug,
                        description: o.description,
                    }
                })
            },
            type_select() {
                return this.state === TYPE_SELECT
            },
            entry_notes() {
                return this.state === ENTRY_NOTES
            },
            entry_type() {
                return this.$store.getters[ENTRYTYPES_TYPE](this.selectec_type)
            },
            entry_aspects() {
                return this.entry_type.content.aspects
            },
            has_pages() {
                // todo duplicate entryMixin
                return this.entry_type.content.meta.hasOwnProperty("pages")
            }
        },
        methods: {
            selection(type) {
                this.selectec_type = type.value
                this.state = ENTRY_NOTES
                this.init_typenotes(this.selectec_type)
            },
            init_typenotes(type_slug) {
                let notes = this.$store.getters[ENTRYTYPES_TYPE_NOTES](type_slug)
                if (!notes) {
                    this.$store.dispatch("entrytypes/init_notes", type_slug)
                }
            },
            aspect_descr_loc(aspect) {
                //console.log([this.selectec_type, aspect.name])
                return [this.selectec_type, aspect.name]
            },
            download() {
                const data = {
                    notes: this.$store.getters[ENTRYTYPES_TYPE_NOTES](this.selectec_type)
                }
                export_data(data, this.$store.getters[ENTRYTYPES_TYPE](this.selectec_type).title + "_notes.json")
            },
            import_data(result) {
                if (result.ok) {
                    this.$store.commit("entrytypes/set_type_notes", {
                        type_slug: this.selectec_type,
                        notes: result.data.notes
                    })
                    //console.log("done")
                }
            }
        },
        watch: {
            page() {
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
