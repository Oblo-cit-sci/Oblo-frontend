<template lang="pug">
  v-btn Load file
    input(type="file"  @change="filesChange($event.target.files)" accept="json/*" class="input-file")
</template>

<script>

  export default {
    name: "LoadFileButton",
    methods: {
      filesChange(files) {
        const file = files[0]
        var reader = new FileReader()

        reader.onload = (event) => {
          try {
            const data= JSON.parse(event.target.result);
            this.$emit("fileload", {ok:true, data: data})
          }catch (e) {
            this.$emit("fileload", {ok: false})
          }
        };

        reader.onerror = (event) => {
         // alert(event.target.error.name);
          this.$emit("fileload", {ok: false})
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
