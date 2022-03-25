import {get_creator} from "~/lib/entry";
import {is_editable_mode, pack_value, unpack} from "~/lib/aspect";
import {mapGetters} from "vuex"

import {
  ACTORS,
  DRAFT,
  EDIT,
  ENTRY, LOCATION,
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
import {locationAspect, template_titleAspect} from "~/lib/template"

export default {
  name: "EntryMixin",
  mixins: [EntryPagesMixin, AspectListMixin, ExportMixin, TypicalAspectMixin, EntryMetaAspects,
    EntryHelperMethodsMixin, URLQueryMixin],
  props:
    {
      entry: {
        type: Object,
        required: true
      }
    },
  data() {
    return {
      aspect_extras: {},
      meta_aspect_modes: {}
    }
  },
  async created() {
  },
  computed: {
    ...mapGetters({"is_admin": "user/is_admin", "username": "user/registered_name"}),
    license_aspect() {
      return this.asp_license("license", ["cc_licenses"], null)
    },
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
    actors() {
      return this.entry.actors
    },
    actors_value: {
      get() {
        return pack_value(this.actors)
      },
      set(actors) {
        this.$store.commit("entries/set_edit_meta_value", {meta_aspect_name: ACTORS, value: actors})
      }
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
      if (this.is_template_outdated && this.query_entry_uuid) {
        return this.get_template_of_version(this.entry)
      }
      return this.get_template(this.entry)
    },
    template_color() {
      return this.$_.get(this.template, "rules.marker_color")
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
      return this.template?.title
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
      return (this.type_name + "_" + this.entry.title).replace(" ", "_")
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
    regular_values() {
      return this.entry.values
    }
  },
  methods: {
    full_title(include_etype_title = true) {
      let result = include_etype_title ? this.type_name + ": " : ""
      result += this.entry.title === "" ? `[${this.$t("comp.entry.no_title")}]` : this.entry.title
      return result
    },
    download() {
      this.export_data(this.prepare_entry_for_download(this.entry), this.download_title)
    }
  },
}
