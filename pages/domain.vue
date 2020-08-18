<template lang="pug">
  .fullSize
    <!--    MenuContainer(-->
    <!--      :over="true"-->
    <!--      :domain_navigation_mode="navigation_mode")-->
    v-dialog(v-model="entrycreate_dialog_open")
      v-card
        v-card-title {{$t("page.domain.create_new_entry")}}
        EntryCreateList(:template_entries="create_templates_options")
    MapWrapper(
      height="100%"
      :domain="domain_name"
      @force_menu_mode_domain="set_menu_state(1)"
      @create_entry="create_entry_or_open_dialog($event)"
      @map="map=$event")
</template>

<script>

  import EntryCreateList from "~/components/EntryCreateList";

  import {SET_DOMAIN} from "~/store";
  import EntryNavMixin from "~/components/EntryNavMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import LayoutMixin from "~/components/global/LayoutMixin"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import MapWrapper from "~/components/map/MapWrapper"
  import {dev_env} from "~/lib/util"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
  import DomainMixin from "~/components/DomainMixin"
  import {MENU_MODE_DOMAIN_OVERVIEW, QP_D, QP_F} from "~/lib/consts"
  import FixDomainMixin from "~/components/global/FixDomainMixin"
  import EntryCreateMixin from "~/components/entry/EntryCreateMixin"

  export default {
    name: "domain",
    // layout: "new_map_layout",
    mixins: [DomainMixin, HasMainNavComponentMixin, EntryNavMixin, EntryCreateMixin,
      PersistentStorageMixin, LayoutMixin, MapIncludeMixin, FixDomainMixin],
    components: {MapWrapper, EntryCreateList},
    data() {
      return {
        entrycreate_dialog_open: false
      }
    },
    beforeRouteEnter(to, from, next) {
      if (!(to.query[QP_D] || to.query[QP_F])) {
        // todo somehow doesn't load...
        next("/")
      } else {
        next()
      }
    },
    created() {
      // console.log("domain page created", this.$route.fullPath)
      if (!dev_env()) {
        window.history.replaceState(null, document.title, "/licci")
      }
      if (this.domain_data.name !== this.$store.getters.domain) {
        this.$store.commit(SET_DOMAIN, this.domain_data)
      }

      if (this.$route.query.f && !this.is_fixed_domain) {
        this.fix_domain(this.$route.query.f)
      }

      this.set_menu_state(MENU_MODE_DOMAIN_OVERVIEW)
    },
    beforeRouteLeave(from, to, next) {
      if (!dev_env()) {
        window.history.replaceState(null, document.title, this.$route.fullPath)
      }
      this.set_menu_open(false)
      next()
    },
    computed: {
    },
    methods: {
      create_entry_or_open_dialog(template_slug = null) {
        if (template_slug) {
          this.create_entry(template_slug)
        } else {
          this.entrycreate_dialog_open = true
        }
      }
    }
  }
</script>

<style scoped>

  .header-domain {
    background-color: white;
    padding: 10px;
  }

  .wide-divider {
    margin: 10px 0;
  }

  .fullWidth {
    width: 100%;
  }

  .fullSize {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
