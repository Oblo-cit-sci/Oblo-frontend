<template lang="pug">
  div
    //div {{is_standalone}}
    //div {{build_time}}
    //v-btn(@click="switch_offline") {{dev_offline_switch_button_label}}
    //v-btn(@click="copy") copy
    //nuxt-link(to="test/pages") aspect tests
    //Aspect(:aspect="aspect")
    //Aspect(:aspect="video_aspect" :ext_value="video_value" mode="view")
    Aspect(:aspect="video_aspect" :ext_value.sync="video_value" mode="edit")
</template>

<script>

import EnvMixin from "~/components/global/EnvMixin";
import OfflineMixin from "~/lib/OfflineMixin";
import Aspect from "~/components/Aspect"
import {pack_value} from "~/lib/aspect"

export default {
  name: "tests",
  mixins: [EnvMixin, OfflineMixin],
  components: {Aspect},
  data() {
    return {
      match: null,
      doc: null,
      nav: null,
      video_aspect: {
        name: "video",
        type: "video",
      },
      video_value: pack_value("https://www.youtube.com/watch?v=eWTmnZB4ZWQ")

    }
  },
  created() {

    // experimental feature. load and run domain-js-plugin
    // const url = this.$api.static.url("js/licci.js")
    // const domain_plugin = document.createElement('script')
    // domain_plugin.setAttribute("type", "text/javascript")
    // domain_plugin.setAttribute("src", url)
    //
    // domain_plugin.onload = function (d) {
    //   console.log("loaded")
    //   console.log(d)
    // }
    //
    // document.getElementsByTagName("head")[0].appendChild(domain_plugin)
    // const fn = window["crossref_transform"];
    // if (typeof fn === "function") fn({"cool": 4});

    // const person = {age: 31}
    // if (person?.age > 30) {
    //   console.log("cool")
    // }
    //
    // if (person?.name === "hans") {
    //   console.log("hi hans")
    // }
    //
    // if (person?.job?.sallary > 300) {
    //   console.log("hi hans")
    // }
    //
    // console.log(person?.name?.trua)
    // console.log(person?.name?.trua)
  },
  watch: {},
  computed: {
    build_time() {
      return process.env.BUILD_TIME || "no build time"
    },
    dev_offline_switch_button_label() {
      return this.is_offline ? "S/ON" : "S/OFF"
    },
  },
  methods: {
    switch_offline() {
      this.$store.commit("dev_switch_offline")
    },
    copy() {
      navigator.clipboard.writeText("heeeetytt")
    }
  }
}
</script>

<style scoped>

</style>
