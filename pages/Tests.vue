<template lang="pug">
  div
    AspectDialog(:aspect="domains" :dialog_open="dialog_open" show_aspect @update:ext_value="select($event)")
    v-container(style="height=400px")
      v-row
        v-col.bg2(cols="3" sm="2")
          v-btn.col_btn press
        v-col.bg(cols="3" sm="2")
          v-btn.col_btn press
        v-col.bg2(cols="8" sm="8")
          v-text-field(placeholder="cool cool cool")

    v-menu(:close-on-content-click="false"
        :nudge-width="200"
        offset-y)
      template(v-slot:activator="{ on, attrs }")
        v-btn(v-on="on" elevation="2" ) types
          v-icon mdi-chevron-down
      v-card
        v-card-title hi


</template>

<script>

  //   primary: '#1976D2',
  // secondary: '#424242',
  // accent: '#82B1FF',
  // error: '#FF5252',
  // info: '#2196F3',
  // success: '#4CAF50',
  // warning: '#FFC107',

  import AspectDialog from "~/components/aspect_utils/AspectDialog"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import OptionsAspect from "~/components/aspects/OptionsAspect"
  import Aspect from "~/components/Aspect"

  import pkg from "~/package"
  import GeocodingMixin from "~/components/map/GeocodingMixin"

  export default {
    name: "Tests",
    mixins: [TriggerSnackbarMixin, GeocodingMixin],
    components: {Aspect, OptionsAspect, AspectDialog},
    async created() {
      const location_ = {"lon":24.550781249998096,"lat":47.405785290060095}
      const data = await this.rev_geocode(location_)
      console.log(data)
      const loc_search = await this.geocode("Parva")
      console.log(loc_search)
    },
    data() {
      return {
        chip_data: {
          color:"info"
        },
        val: {value: null},
        o_a: {
          name: "OA",
          type: "options",
          attr: {},
          options: [
            {
              name: "A",
              type: "str",
              attr: {max: 90}
            }, {
              name: "B",
              type: "str",
              attr: {max: 90}
            }
          ]
        },
        selected_domain: {value: null},
        dialog_open: false,
        domains: {
          name: "Domains",
          type: "select",
          attr: {
            force_view: "grid",
          },
          items: [
            {value: "licci", text: "LICCI", icon: "images/domains/licci/icon.png"},
            {value: "conecte", text: "Conecte", icon: "images/domains/conecte/icon.png"},
          ]
        }
      }
    },
    computed: {
      bp() {
        return this.$vuetify.breakpoint.name
      }
    },
    methods: {
      test() {
        this.ok_snackbar(pkg.version)
      },
      select(domain) {
        console.log("selected", domain)
        this.dialog_open = false
        this.ok_snackbar("cool")
      },
      trigger() {
        this.ok_snackbar("yippi" + (Math.random() * 1000))
      }
    },
    watch: {
      selected_domain(domain) {
        console.log("selected", domain)
        this.dialog_open = false
      }
    }
  }
</script>

<style scoped>

    .bg {
      background: #ff0000;
    }

    .bg2 {
      background: #ffff00;
    }

    .col_btn {
      max-width: 100%;
      margin: 6px auto;
    }

  .v-expansion-panel--active > .v-expansion-panel-header {
    min-height: 36px;
  }

  .v-expansion-panel-header {
    min-height: 36px;
  }

  .v-expansion-panel-content__wrap {
    padding: 0 0 0;
    background-color: red;
  }
</style>
