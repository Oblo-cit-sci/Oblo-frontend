<template lang="pug">
  v-flex(xs12 sm10 md10)
    v-row
      v-col
        div {{$t("asp.username.label")}}: {{registered_name}}
        GlobalRoleChip.mt-2(:global_role="user_data.global_role")
        div.mt-2(v-if="user_data.account_deactivated" style="color:red") {{$t("page.actor.deactivated")}}
      v-col
        v-row
          v-skeleton-loader.m-auto(width="80%" max-height="200px" type="image" loading v-if="!img_loaded")
          v-img(:src="profile_pic" max-height=200 contain @load="img_loaded=true")
    h2 {{$t("page.actor.h1")}}
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col(cols=10)
        Aspect(:aspect="aspect" :ext_value.sync="user_data[aspect.name]")
    ActorAdminEdit(v-if="user_loaded && i_am_admin" :actor="user_data" @role_changed="new_global_role($event)")
    div
      v-divider.wide_divider
      h2 {{$t("page.actor.h2")}}
      EntryListWrapper(
        :style="main_container_width_style"
        :preview_options="entry_preview_options"
        :wait="waiting"
        :search_config="search_config")
</template>

<script>
import Aspect from "~/components/Aspect";
import EntryListWrapper from "~/components/EntryListWrapper"
import ActorAdminEdit from "~/components/actor/ActorAdminEdit"
import GlobalRoleChip from "~/components/actor/GlobalRoleChip"
import LayoutMixin from "~/components/global/LayoutMixin"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import NavBaseMixin from "~/components/NavBaseMixin"
import FilterMixin from "~/components/FilterMixin"
import {mapGetters} from "vuex"

export default {
  name: "actor",
  mixins: [LayoutMixin, TypicalAspectMixin, TriggerSnackbarMixin, NavBaseMixin, FilterMixin],
  components: {
    GlobalRoleChip,
    ActorAdminEdit,
    EntryListWrapper,
    Aspect
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
      img_loaded: false
    }
  },
  created() {
    this.$api.actor.basic(this.registered_name).then(({data}) => {
      this.user_data = data.data
      // console.log(this.user_data)
      this.user_loaded = true
      this.waiting = false
    }).catch(err => {
      this.err_error_snackbar(err)
      this.$router.back()
    })
  },
  computed: {
    ...mapGetters({
      "i_am_admin": "user/is_admin"
    }),
    profile_pic() {
      return this.$api.actor.url_profile_pic(this.registered_name)
    },
    registered_name() {
      return this.$route.query.name
    },
    search_config() {
      return [this.get_actor_filter(this.registered_name)]
    },
    entry_preview_options() {
      return {
        show_language_chip: true
      }
    }
  },
  methods: {
    new_global_role(role) {
      this.user_data.global_role = role
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
