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
        div(v-for="(aspect,index) in entry_aspects" :key="aspect.key")
          div(v-if="divider_after(index)")
            v-divider
            h2 {{page_title(index)}}
          AspectDescription(:aspect="aspect" :loc="aspect_descr_loc(aspect)")
        v-btn(@click="download") download
          v-icon.ml-2 mdi-download
        LoadFileButton(@fileload="import_data($event)")
</template>

<script>

    import SingleSelect from "../components/SingleSelect";
    import AspectDescription from "../components/AspectDescription";
    import {ENTRYTYPES_TYPE, ENTRYTYPES_TYPE_NOTES} from "../lib/store_consts";
    import PersistentStorageMixin from "../components/PersistentStorageMixin";
    import {export_data} from "../lib/import_export";
    import LoadFileButton from "../components/LoadFileButton";

    const TYPE_SELECT = "type_select"
    const ENTRY_NOTES = "entry_notes"

    export default {
        name: "EntrytypeNotes",
        mixins: [PersistentStorageMixin],
        components: {LoadFileButton, AspectDescription, SingleSelect},
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
            options() {
                return this.$_.map(this.$store.getters.entrytypes, o => {
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
                if(!notes) {
                    this.$store.dispatch("entrytypes/init_notes", type_slug)
                }
            },
            page(index) {
                return this.entry_aspects[index].attr.page || 0
            },
            divider_after(index) {
                return this.has_pages && index === 0 || (index > 1 &&
                    this.page(index) !== this.page(index - 1))
            },
            page_title(index) {
                return this.entry_type.content.meta.pages[this.page(index)].title
            },
            aspect_descr_loc(aspect) {
                //console.log([this.selectec_type, aspect.name])
                return [this.selectec_type, aspect.name]
            },
            download() {
                export_data(this.$store.getters[ENTRYTYPES_TYPE_NOTES](this.selectec_type), this.$store.getters[ENTRYTYPES_TYPE](this.selectec_type).title+"_notes.json")
            },
            import_data(result) {
                if(result.ok) {
                    this.$store.commit("entrytypes/set_type_notes", {type_slug: this.selectec_type ,notes: result.data})
                    console.log("done")
                }
                /*
                debugger
                if(!file)
                    return
                let reader = new FileReader()
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        //this.loading = false

                        console.log("done", data)

                    } catch (e) {
                        //this.loading = false
                        console.log("fucked loading json")
                        console.log("result",event.target.result)
                        console.log(typeof  event.target.result)
                        console.log(e)

                        //this.$emit("fileload", {ok: false})
                    }
                };
                reader.onerror = (event) => {
                    console.log("fucked reading file")
                    // alert(event.target.error.name);
                    //this.$emit("fileload", {ok: false})
                    //this.loading = false
                };
                console.log(file)
                reader.readAsText(file);
                 */
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
