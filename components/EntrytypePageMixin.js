export default {
  name: "EntrytypePageMixin",
  data() {
    return {
      page: this.$route.query.page | 0,
    }
  },
  computed: {
    has_pages() {
      return this.entry_type.content.meta.hasOwnProperty("pages")
    },
    named_pages() {
      return this.entry_type.content.meta.hasOwnProperty("named_pages") || false
    },
    pages() {
      return this.entry_type.content.meta.pages || []
    },
    last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    page_title() {
      return this.entry_type.title + (this.title ? ": " + this.title : "")
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
