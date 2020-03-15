
const accepted_filetypes = ["json", "image"]

export default {
  name: "FileLoadMixin",
  props: {
    filetype: {
      type: String,
      default: "json",
      validator: function (value) {
        return accepted_filetypes.includes(value)
      }
    },
    size_limit: {
      type: Number
    }
  },
  data() {
    return {
      loading: false,
      file_meta: {}
    }
  },
  computed: {
    accepted() {
      switch (this.filetype) {
        case "json" :
          return "application/json"
        case "image":
          return "image/jpg"
        default:
          return ""
      }
    }
  },
  methods: {
    filesChange(files) {
      this.loading = true
      const file = files[0]
      this.file_meta = {
        name: file.name,
        type: file.type,
        size: file.size
      }
      let reader = new FileReader()
      reader.onerror = (event) => {
        this.$emit("fileload", {ok: false, meta: this.file_meta})
        this.loading = false
      };
      switch (this.filetype) {
        case "json":
          reader.onload = this.onload_json
          reader.readAsText(file);
          break
        case "image":
          reader.onload = this.onload_image
          reader.readAsDataURL(file)
      }
    },
    onload_json(event) {
      try {
        if (event.target.readyState !== FileReader.DONE) {
          console.log("reader not done")
          return;
        }
        const data = JSON.parse(event.target.result);
        this.loading = false
        this.$emit("fileload", {ok: true, data: data, meta: this.file_meta})
      } catch (e) {
        this.loading = false
        this.$emit("fileload", {ok: false})
      }
    },
    onload_image(event) {
      this.loading = false
      this.$emit("fileload", {ok: true, data: event.target.result, meta: this.file_meta})
    }
  }
}
