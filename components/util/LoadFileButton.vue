<template lang="pug">
  div
    slot
      v-btn(:loading="btn_loading" v-bind="btn_props")
        v-icon {{btn_icon}}
        span(v-if="label!==''") {{label}}
        input.input-file(type="file" @change="filesChange($event.target.files)" :accept="accepted")
</template>

<script>

  const accepted_filetypes = ["json","image"]

  export default {
    name: "LoadFileButton",
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
      },
      label: {
        type: String,
        default: "Add File"
      },
      btn_props: Object,
      btn_icon: {
        type: String,
        default: "mdi-import"
      },
      force_load: Boolean
    },
    data() {
      return {
        loading: false,
        file_meta: {}
      }
    },
    computed: {
      btn_loading() {
        return this.loading || this.force_load
      },
      accepted() {
        switch (this.filetype) {
          case "json" :
            return "application/json"
          case "image":
            return [".jpg", ".png", ".gif", ".jpeg"]//"image/jpg"
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
</script>

<style scoped>
  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    position: absolute;
  }
</style>
