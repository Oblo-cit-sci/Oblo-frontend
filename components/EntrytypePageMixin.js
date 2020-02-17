export default {
  name: "EntrytypePageMixin",
  data() {
    return {
      page: this.$route.query.page | 0,
    }
  },
  computed: {
    has_pages() {
      return this.template.rules.hasOwnProperty("pages")
    },
    named_pages() {
      return this.template.rules.hasOwnProperty("named_pages") || false
    },
    slug() {
      return this.template.slug
    },
    pages() {
      return this.template.rules.pages || []
    },
    last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    page_title() {
      return this.template.title + (this.title ? ": " + this.title : "")
    },
    shown_aspects() {
      if (this.has_pages) {
        return this.$_.filter(this.template.aspects, (a) => {
          return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
            (this.page > 0 && a.attr.page === this.page))
        })
      }
      return this.template.aspects
    },
  },
  methods: {

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
