<template lang="pug">
  div
    v-autocomplete(
      outlined
      v-model="selection"
      :items="actors"
      dense
      :loading="isLoading"
      :search-input.sync="search"
      color="grey"
      chips
      hide-no-data
      hide-selected
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
</template>

<script>

  export default {
    name: "ActorSearch",
    mixins: [],
    components: {},
    props: {
      multiple: Boolean
    },
    data() {
      return {
        actors: [],
        isLoading: false,
        selection: null,
        search: ""
      }
    },
    created() {

    },
    computed: {},
    methods: {
      avatar_url(registered_name) {
        return this.$api.url_actor__$registered_name__avatar(registered_name)
      },
      remove(registered_name) {
        console.log("rem")
        if (this.multiple) {
          this.selection = this.selection.filter(actor => actor.registered_name !== registered_name)
        } else {
          this.selection = null
        }
        this.actors = []
      }
    },
    watch: {
      search(val) {
        console.log("S", val)
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
          this.actors = data.data
        }).catch(err => {
          console.log(err)
        }).finally(() => (this.isLoading = false))
      },
      selection(val) {
        console.log(val)
        this.search = ""
        if (this.multiple) {
          this.actors = this.selection
        } else {
          if(this.selection) {
            this.actors = [this.selection]
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
