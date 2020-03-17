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
      hide-no-data
      hide-selected
      hide-details
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
      multiple: Boolean,
      value: {
        type: [Object, Array]
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
      }
    },
    created() {
      this.actors = this.value
    },
    computed: {
      selection: {
        get() {
          return this.value
        },
        set: function(val) {
          this.search = ""
          if (this.multiple) {
            this.actors = val
          } else {
            if(val) {
              this.actors = [val]
            }
          }
          this.$emit("input", val)
        }
      }
    },
    methods: {
      avatar_url(registered_name) {
        return this.$api.url_actor__$registered_name__avatar(registered_name)
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
        }
        else {
          if(!this.multiple && this.selection) {
            // todo remove first one
          }
        }

        if (this.isLoading || val.length < 4) return
        this.isLoading = true

        // Lazily load input items
        this.$api.actor_search({name: val}).then(({data}) => {
          this.actors = data.data.filter(actor => !this.exclude_reg_names.includes(actor.registered_name))
        }).catch(err => {
          console.log(err)
        }).finally(() => (this.isLoading = false))
      }
    }
  }
</script>

<style scoped>

</style>
