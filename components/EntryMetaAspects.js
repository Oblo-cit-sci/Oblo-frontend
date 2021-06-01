import {NO_DOMAIN} from "~/lib/consts";

export default{
  name: "EntryMetaAspects",
  methods: {
    get_meta_aspects(domain_name) {
      const language = this.$store.getters.domain_language
      const user_meta_aspects = this.$store.getters["user/meta_aspects"]
      const domain_meta_aspects = this.$store.getters["domain/lang_domain_data"](domain_name,language).entry?.meta_aspects || []
      const no_domain_meta_aspects = this.$store.getters["domain/lang_domain_data"](NO_DOMAIN,language).entry?.meta_aspects || []

      // console.log( this.$store.getters["domain/lang_domain_data"](NO_DOMAIN,language))
      // console.log("user_meta_aspects", user_meta_aspects)
      // console.log("domain_meta_aspects", domain_meta_aspects)
      // console.log("no_domain_meta_aspects", no_domain_meta_aspects)
      return this.$_.concat(user_meta_aspects, domain_meta_aspects, no_domain_meta_aspects)
    }
  }
}
