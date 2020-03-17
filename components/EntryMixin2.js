export default {
  name: "EntryMixin2",
  mixins: [],
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {

    get_attachments_to_post() {
      const new_files_data = []
      for (let file of this.entry.attached_files) {
        if (!file.hasOwnProperty("url")) {
          new_files_data.push(file)
        }
      }
      return new_files_data
    }
  }
}
