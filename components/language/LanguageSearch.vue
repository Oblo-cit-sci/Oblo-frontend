<template lang="pug">
  v-autocomplete(
    outlined
    :search-input.sync="query"
    :loading="isLoading"
    hide-no-data
    v-model="selectedLanguage"
    :items="languageOptions")
</template>

<script>
export default {
  name: "LanguageSearch",
  props: {
    value: {
      type: Object
    },
    filter_out: {
      type: Array
    }
  },
  data() {
    return {
      query: "",
      languageOptions: [],
      isLoading: false
    }
  },
  computed: {
    selectedLanguage: {
      get: function () {
        return this.value
      },
      set: function (val) {
        this.$emit("input", this.languageOptions.filter(o => o.value === val)[0])
      }
    }
  },
  watch: {
    query(val) {
      if (!val) {
        this.languageOptions = []
        return
      }
      if (this.isLoading || val.length < 2) return
      this.isLoading = true
      this.$api.language.search(val).then(({data}) => {
        this.languageOptions = data.languages
        if (this.languageOptions.length === 0) {
          this.errorMsg = "EN:No language found"
        }
        this.languageOptions.forEach(o => {
          if (this.filter_out.includes(o.value)) {
            o.disabled = true
          }
        })
      }, err => {
        console.log(err)
      }).finally(() => (this.isLoading = false))
    }
  }
}
</script>

<style scoped>

</style>
