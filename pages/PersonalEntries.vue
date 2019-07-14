<template lang="pug">
  v-layout(column)
    v-layout(row wrap justify-start)
      v-flex(
        v-for="o in filter_options" :key="o.value")
        v-checkbox(
          v-model="filter"
          :label="o.label"
          :value="o.value")
    v-layout(row justify-center)
      entrylist(xm12 lg12 :entries="entries")
</template>

<script>
  import Entrylist from "../components/Entrylist";

  const ld = require("lodash");

  const options = [
    {
      label: "All",
      value: "all"
    },
    {
      label: "Owner",
      value: "owners"
    },
    {
      label: "Reviewer",
      value: "reviewers"
    },
    {
      label: "Explicit access",
      value: "explicit_access"
    },
    {
      label: "Collaborator",
      value: "collaborators"
    }
  ];

  const roles = ld.map(options, (o) => {
    return o.value
  });

  export default {
    name: "PersonalEntries",
    components: {Entrylist},
    data() {
      return {
        filter_options: options,
        filter: ["all"]
      }
    },
    computed: {
      entries() {
        const registered_name = this.$store.state.user.user_data.registered_name;
        let result_entries = Array.from(this.$store.state.entries.entries.values())
        if (this.filter.length !== 1) {
          if (this.$_.last(this.filter) === "all") {
            this.filter = ["all"]
            //console.log(this.$store.state.entries)
          } else {
            if (this.filter[0] === "all") {
              this.filter.shift()
            }
          }
        }
        return result_entries
      }
    }
  }
</script>

<style scoped>

</style>
