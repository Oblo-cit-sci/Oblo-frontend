export default {
  name: "SelectComponentMixin",
  props: {
    data_source: String
  },
  methods: {
    get_icon_url(icon) {
      return this.$api.url_entry__$slug__entry_file__$file_name(this.data_source, icon)
    }
  }
}
