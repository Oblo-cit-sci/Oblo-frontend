<template lang="pug">
  v-btn(:loading="loading")
    v-icon.mr-2 mdi-import
    span Load file
    input(type="file"  @change="filesChange($event.target.files)" :accept="accepted" class="input-file")
</template>

<script>

  const accepted_filetypes = ["json", "image"]

  export default {
    name: "LoadFileButton",
    props: {
      filetype: {
        type: String
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
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            this.loading = false
            this.$emit("fileload", {ok: true, data: data})
          } catch (e) {
            this.loading = false
            this.$emit("fileload", {ok: false})
          }
        };
        reader.onerror = (event) => {
          // alert(event.target.error.name);
          this.$emit("fileload", {ok: false})
          this.loading = false
        };
        reader.readAsText(file);
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
