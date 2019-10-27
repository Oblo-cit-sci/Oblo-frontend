<template lang="pug">
  v-btn(:loading="loading") Load file
    input(type="file"  @change="filesChange($event.target.files)" accept="json/*" class="input-file")
</template>

<script>

    export default {
        name: "LoadFileButton",
        data() {
            return {
                loading: false
            }
        },
        methods: {
            filesChange(files) {
                console.log("fch")
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
