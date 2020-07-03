<template lang="pug">
  v-flex(xs12 sm10 md10)
    v-row
      v-col
        div {{$t("asp.username.label")}}: {{registered_name}}
        GlobalRoleChip.mt-2(:global_role="user_data.global_role")
        div.mt-2(v-if="user_data.account_deactivated" style="color:red") {{$t("actor.deactivated")}}
      v-col
        v-row
          v-img(:src="profile_pic" max-height=200 contain)
    h2 {{$t("actor.h1")}}
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col(cols=10)
        Aspect(:aspect="aspect" :ext_value.sync="user_data[aspect.name]")
    ActorAdminEdit(v-if="user_loaded && is_admin" :actor="user_data")
    div
      v-divider.wide_divider
      h2 {{$t("actor.h2")}}
      EntryListWrapper(
        :style="main_container_width_style"
        :wait="waiting"
        :configuration="{required:[{name:'actor', 'registered_name':registered_name}]}")
</template>

<script>
  import EntryPreviewList from "~/components/entry/EntryPreviewList";
  import Aspect from "~/components/Aspect";
  import Taglist from "~/components/global/Taglist";
  import EntryListWrapper from "~/components/EntryListWrapper"
  import ActorAdminEdit from "~/components/actor/ActorAdminEdit"
  import GlobalRoleChip from "~/components/actor/GlobalRoleChip"
  import LayoutMixin from "~/components/global/LayoutMixin"
  import {USER_GLOBAL_ROLE} from "~/store/user"
  import {ADMIN} from "~/lib/consts"
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

  export default {
    name: "actor",
    mixins: [LayoutMixin, TypicalAspectMixin],
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
            this.asp_public_name(),
            this.asp_actor_description()
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
        return this.$api.url_actor__$registered_name__profile_pic(this.registered_name)
      },
      registered_name() {
        return this.$route.query.name
      },
      is_admin() {
        return this.$store.getters[USER_GLOBAL_ROLE] === ADMIN
      }
    },
    methods: {},
    watch: {}
  }
</script>

<style scoped>

</style>
