import {get_creator, get_entry_titleAspect, new_value_getter} from "~/lib/entry";
import {aspect_loc_str2arr, is_editable_mode, loc_append, loc_prepend} from "~/lib/aspect";
import {mapGetters} from "vuex"

import {
  ASPECT,
  DRAFT,
  EDIT,
  ENTRY,
  META,
  META_ASPECT_LIST,
  PUBLISHED,
  REQUIRES_REVIEW,
  REVIEW, TAG,
  VIEW
} from "~/lib/consts";


import {check_str_is_uuid, printDate} from "~/lib/util";

import EntryPagesMixin from "~/components/entry/EntryPagesMixin"
import AspectListMixin from "~/components/global/AspectListMixin"
import ExportMixin from "~/components/global/ExportMixin"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";
import EntryMetaAspects from "~/components/EntryMetaAspects";
import EntryHelperMethodsMixin from "~/components/entry/EntryHelperMethodsMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin"

export default {
  name: "EntryMixin",
  mixins: [EntryPagesMixin, AspectListMixin, ExportMixin, TypicalAspectMixin, EntryMetaAspects,
  EntryHelperMethodsMixin, URLQueryMixin],
  props:
    {
      entry: {
        type: Object,
        required: true
      },
      include_etype_in_title: {
        type: Boolean
      }
    },
  data() {
    return {
      // aspect_locs: {},
      aspect_extras: {},
      meta_aspect_modes: {}
    }
  },
  async created() {
  },
  computed: {
    ...mapGetters({"is_admin": "user/is_admin", "username": "user/registered_name"}),
    meta_aspects() {
      // todo be more generic where the licenses come form. user settings...
      // todo, allow changing the language if(this.$store.getter.user.editor_config.)
      let aspects = [this.license_aspect, this.asp_privacy()]
      for (let aspect of aspects) {
        this.meta_aspect_modes[aspect.name] = this.license_privacy_mode
      }
      if (this.is_review_mode) {
        const lang_asp = this.asp_language()
        aspects.push(lang_asp)
        this.meta_aspect_modes[lang_asp.name] = EDIT
      }
      return aspects
    },
    license_privacy_mode() {
      if (this.logged_in && this.is_creator || this.$store.getters["user/is_admin"]) {
        return EDIT
      } else {
        return VIEW
      }
    },
    uuid() {
      return this.entry.uuid
    },
    entry_date() {
      return printDate(new Date(this.entry.creation_ts))
    },
    tags_config() {
      return this.$_.get(this.template.rules, "tags_config", [])
    },
    // has_parent() {
    //   // return has_parent(this.entry)
    // },
    actors() {
      return this.entry.actors
    },
    creator() {
      return get_creator(this.entry)
    },
    is_creator() {
      return this.creator.registered_name === this.username
    },
    template_slug() {
      return this.entry.template.slug
    },
    template() {
      // console.log("template on page: ", this.$route.name, this.query_entry_uuid)
      if(this.is_template_outdated && this.query_entry_uuid) {
        return this.get_template_of_version(this.entry)
      }
      return this.get_template(this.entry)
    },
    template_color() {
      return this.$_.get(this.template, "rules.marker_color")
    },
    entry_title() {
      if (this.is_editable_mode) {
        // todo dirty. do this similar to new tag schema. have "titleAspect" in the attr of the actual aspect that
        // sets the title
        let titleAspect = get_entry_titleAspect(this.template)
        if (!titleAspect) {
          return this.entry.title
        }
        // console.log("titleAspect", titleAspect)
        let title = new_value_getter(this.regular_values,titleAspect)
        title = this.$_.get(title, "value", "")
        return this.full_title(title)
      } else { // VIEW
        return this.full_title()
      }
    },
    entry_image() {
      if (this.entry.image) {
        if (this.entry.image.startsWith("http")) {
          return this.entry.image
        } else if (check_str_is_uuid(this.entry.image)) {
          if (this.entry.status === "draft") {
            const img_data = this.$store.getters["files/get_file"](this.entry.image)
            if (img_data) {
              return img_data.data
            }
          } else {
            return this.$api.entry.url_uuid_attachment(this.uuid, this.entry.image)
          }
        } else {
          return null
        }
      }
    },
    type_name() {
      return this.template.title
    },
    aspect_loc() {
      return [ENTRY, this.uuid, this.template_slug]
    },
    outdated() {
      return false
      // return this.entry.template_version !== this.template.version
    },
    is_template_outdated() {
      return this.entry.template_version < this.get_template(this.entry).version
    },
    download_title() {
      // todo title, wont update in real time
      const entry_title = this.$store.getters["entries/get_entry_title"](this.uuid)
      return (this.type_name + "_" + entry_title).replace(" ", "_")
    },
    is_draft() {
      return this.entry.status === DRAFT
    },
    is_published() {
      return this.entry.status === PUBLISHED
    },
    is_requires_review() {
      return this.entry.status === REQUIRES_REVIEW
    },
    is_view_mode() {
      return this.mode === VIEW
    },
    is_edit_mode() {
      return this.mode === EDIT
    },
    is_review_mode() {
      return this.mode === REVIEW
    },
    is_editable_mode() {
      return is_editable_mode(this.mode)
    },
    tags() {
      // console.log("template", this.template.entry_refs, this.entry.tags)
      const e_tags = this.entry.tags
      const result_tags = {}
      for (let group_name of Object.keys(this.entry.tags)) {
        let tag_values = e_tags[group_name]
        const template_tag_refs = this.template.entry_refs.filter(t => t.ref_type === TAG)
        const tag_ = this.$_.find(template_tag_refs, ref => {
          if (!Array.isArray(ref.tag)) {
            return ref.tag.name === group_name
          } else {
            return this.$_.some(ref.tag, tag_d => tag_d.name === group_name)
          }
        })
        if (tag_) {
          const code_slug = tag_.dest_slug
          const lang = this.$store.getters["user/settings_value"]("domain_language")
          result_tags[group_name] = this.$store.getters["templates/tags_of_code"](code_slug, lang, tag_values)
        } else {
          console.log("could not find tag for ", group_name, "in", template_tag_refs)
        }
      }
      return result_tags
    },
    version() {
      return this.entry.version
    },
    aspects() {
      return this.template.aspects
    },
    aspect_locs() {
      const aspect_locs = {}
      // console.log("ENTRY_ ASPECT-LOC", this.aspect_loc)
      for (let aspect of this.aspects) {
        aspect_locs[aspect.name] = loc_append([this.aspect_loc], ASPECT, aspect.name)
      }
      for (let aspect of META_ASPECT_LIST) {
        aspect_locs[aspect] = loc_append([this.aspect_loc], META, aspect)
      }
      return aspect_locs
    },
    regular_values() {
      return this.entry.values
    }
  },
  methods: {
    full_title(title) {
      // console.log(title, this.entry, this.template)
      if (!title) {
        title = this.entry.title
      }
      // todo template sometimes missing... before loaded?
      if (title === ""){
        return this?.template?.title || ""
      } else {
        let full_title = this.include_etype_in_title ? this?.template?.title : ""
        if (this.include_etype_in_title) {
          full_title += title ? ": " + title : ""
        } else {
          full_title = title
        }
        return full_title
      }
    },
    download() {
      this.export_data(this.prepare_entry_for_download(this.entry), this.download_title)
    }
  },
  watch: {
    entry_title(new_title) {
      this.$store.commit("entries/update_title", {title: new_title})
    },
  }
}
