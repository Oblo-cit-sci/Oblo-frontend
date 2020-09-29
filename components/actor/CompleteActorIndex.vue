<template lang="pug">
  div
    v-text-field(
      v-model="search_field"
      append-outer-icon="mdi-account-search"
      @click:append-outer="search_user(search_field)"
      @keydown="check_enter($event)"
      clearable
      @click:clear="clear_search")
    ActorList(:actors="filtered_actors")
</template>

<script>
import ActorList from "~/components/actor/ActorList";

/**
 * ok for now, would probably need a pagination...
 */
export default {
  name: "CompleteActorIndex",
  components: {ActorList},
  data() {
    return {
      search_field: "",
      actors: [],
      searched_actors: null,
    }
  },
  created() {
    this.$api.actor.get_all(true).then(({data}) => {
      this.actors = data.data
    })
  },
  methods: {
    search_user(user_name) {
      this.$api.actor.search({name: user_name, fields: ["global_role", "account_deactivated"]}).then(({data}) => {
        this.searched_actors = data.data
      }, err => {
        console.log(err)
      })
    },
    check_enter(keyEvent) {
      if (keyEvent.keyCode === 13) {
        this.search_user(this.search_field)
      }
    },
    clear_search() {
      this.search_field = ""
      this.searched_actors = null
    }
  },
  computed: {
    filtered_actors() {
      if (this.searched_actors) {
        return this.searched_actors
      } else {
        return this.actors
      }
    }
  }
}
</script>

<style scoped>

</style>
