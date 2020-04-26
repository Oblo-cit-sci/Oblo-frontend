<template lang="pug">
  v-flex(xs12 sm10 md10)
    v-row
      v-col
        div Username: {{user_data.registered_name}}
        GlobalRoleChip.mt-2(:global_role="user_data.global_role")
      v-col
        v-row
          v-img(:src="profile_pic" max-height=200 contain)
    h2 General information
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col(cols=10)
        Aspect(:aspect="aspect" :ext_value.sync="user_data[aspect.name]")
    ActorAdminEdit(v-if="user_loaded && is_admin" :actor="user_data")
    div
      v-divider.wide_divider
      h2 Entries
      EntryListWrapper(
        :wait="waiting"
        :configuration="{required:[{name:'actor', registered_name:user_data.registered_name}]}")
</template>

<script>
  import EntryPreviewList from "~/components/entry/EntryPreviewList";
  import Aspect from "~/components/Aspect";
  import Taglist from "~/components/global/Taglist";
  import EntryListWrapper from "~/components/EntryListWrapper"
  import ActorAdminEdit from "~/components/actor/ActorAdminEdit"
  import IsAdminMixin from "~/components/actor/IsAdminMixin"
  import GlobalRoleChip from "~/components/actor/GlobalRoleChip"

  export default {
    name: "actor",
    mixins: [IsAdminMixin],
    components: {
      GlobalRoleChip,
      ActorAdminEdit,
      EntryListWrapper,
      EntryPreviewList,
      Aspect,
      Taglist
    },
    props: {},
    data() {
      return {
        waiting: true,
        user_data: {},
        user_loaded: false,
        profile_aspects: [
          {
            name: "public_name",
            label: "Public name",
            description: "",
            type: "str",
            attr: {
              max: 40,
              unpacked: true
            },
            value: ""
          },
          {
            name: "description",
            label: "Description",
            description: "",
            type: "str",
            attr: {
              max: 980,
              unpacked: true
            },
            value: ""
          },
          {
            name: "location",
            label: "Location",
            description: "main location",
            type: "location",
            attr: {
              max: 80,
              unpacked: true,
              input: ["search"]
            },
            value: null
          },
          // {
          //   name: "Interested topics",
          //   description: "LICCIs you are interested in",
          //   type: "multiselect",
          //   items: ["empty upsi"],
          //   attr: {
          //     unpacked: true
          //   },
          //   value: []
          // }
        ],
      }
    },
    created() {
      this.$api.actor__$registered_name__basic(this.registered_name).then(({data}) => {
        this.user_data = data.data
        this.user_loaded = true
        this.waiting = false
      }).catch(err => {
        console.log(err)
      })
    },
    computed: {
      profile_pic() {
        return this.$api.url_actor__$registered_name__profile_pic(this.user_data.registered_name)
      },
      registered_name() {
        return this.$route.query.name
      }
    },
    methods: {},
    watch: {}
  }
</script>

<style scoped>

</style>
