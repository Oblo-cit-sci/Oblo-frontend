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
      type: String
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
        this.$emit("input", val)
      }
    }
  },
  watch: {
    query(val) {
      if (!val) {
        return
      }

      if (this.isLoading || val.length < 2) return
      this.isLoading = true
      this.$api.language.search(val).then(({data}) => {
        this.languageOptions = data.languages

        if (this.languageOptions.length === 0) {
          this.errorMsg = "No  language found"
        }
      }, err => {
        console.log(err)
      }).finally(() => (this.isLoading = false))
    }
  }
}
</script>

<style scoped>

</style>
