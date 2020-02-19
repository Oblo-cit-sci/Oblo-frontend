<template lang="pug">
  v-btn(:loading="loading")
    v-icon.mr-2 mdi-import
    span {{label}}
    input(type="file" @change="filesChange($event.target.files)" :accept="accepted" class="input-file")
</template>

<script>

  const accepted_filetypes = ["json", "image"]

  export default {
    name: "LoadFileButton",
    props: {
      label: {
        type: String,
        default: "Add File"
      },
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
        loading: false
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
        let reader = new FileReader()
        reader.onerror = (event) => {
          // alert(event.target.error.name);
          this.$emit("fileload", {ok: false})
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
          const data = JSON.parse(event.target.result);
          this.loading = false
          this.$emit("fileload", {ok: true, data: data})
        } catch (e) {
          this.loading = false
          this.$emit("fileload", {ok: false})
        }
      },
      onload_image(event) {
        this.loading = false
        this.$emit("fileload", {ok: true, data: event.target.result})
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
