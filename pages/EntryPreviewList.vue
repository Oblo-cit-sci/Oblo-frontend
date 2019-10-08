<!-- New page for preview list, maybe we can show one list of entries or the other, 
depending on the domain, and use the same page-->
<template lang="pug">
  v-container(grid-list-md justify-start justify-center)
      entrypreview(:entries="entries")
</template>

<script>
  import Entrypreview from "../components/EntryPreview";

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
    name: "EntryPreviewList",
    components: {Entrypreview},
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
