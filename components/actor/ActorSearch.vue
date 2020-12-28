<template lang="pug">
  div
    v-autocomplete(
      outlined
      v-model="selection"
      :items="actors"
      dense
      :loading="isLoading ? 'info' : false"
      :search-input.sync="search"
      color="grey"
      chips
      no-filter
      hide-selected
      hide-no-data
      :error-messages="errorMsg"
      placeholder="type in order to search for other users"
      item-text="public_name"
      item-value="registered_name"
      prepend-inner-icon="mdi-account-search"
      :multiple="multiple"
      return-object)
      template(v-slot:selection="data")
        v-chip(:input-value="data.selected"
          pill
          close
          @click:close="remove(data.item.registered_name)")
          v-avatar(left)
            v-img(:src="avatar_url(data.item.registered_name)")
          span {{data.item.public_name}}
      template(v-slot:item="data")
        v-list-item-avatar
          v-img(:src="avatar_url(data.item.registered_name)")
        v-list-item-content
          v-list-item-title {{data.item.public_name}}
          v-list-item-subtitle {{data.item.registered_name}}
</template>

<script>

export default {
  name: "ActorSearch",
  mixins: [],
  components: {},
  props: {
    multiple: {
      type: Boolean,
      default: true
    },
    min: {
      type: Number,
      default: 0,
      required: false,
    },
    value: {
      type: [Object, Array],
      default: () => []
    },
    exclude_reg_names: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      actors: [],
      isLoading: false,
      search: "",
      errorMsg: null
    }
  },
  created() {
    this.actors = this.value
  },
  computed: {
    selection: {
      get() {
        if (this.multiple) {
          return this.value
        } else {
          return this.$_.get(this.value, 0, null)
        }
      },
      set: function (val) {
        this.search = ""
        if (this.multiple) {
          this.actors = val
        } else {
          if (val) {
            this.actors = [val]
          }
        }
        this.$emit("input", val)
        if (this.min !== 0) {
          // if no actor, its an error state
          this.$emit("update:error", !val)
          if (!val) {
            this.errorMsg = this.$t("asp.entry_roles.search.min-msg", {min: this.min})
          }
        }
      }
    },
    rules() {
      return [v => {
        return v || "min 1"
      }]
    }
  },
  methods: {
    avatar_url(registered_name) {
      return this.$api.actor.url_avatar(registered_name)
    },
    remove(registered_name) {
      if (this.multiple) {
        this.selection = this.selection.filter(actor => actor.registered_name !== registered_name)
      } else {
        this.selection = null
      }
    }
  },
  watch: {
    search(val) {
      if (!val) {
        return
      } else {
        if (!this.multiple && this.selection) {
          // todo remove first one
          console.log("actor search. que?")
        }
      }
      this.errorMsg = null
      if (this.isLoading || val.length < 4) return
      this.isLoading = true

      // Lazily load input items
      this.$api.actor.search({name: val}).then(({data}) => {
        const result = data.data.filter(actor => !this.exclude_reg_names.includes(actor.registered_name))
        this.actors = this.$_.concat(this.value, result)
        if (result.length === 0) {
          this.errorMsg = "No user found"
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
