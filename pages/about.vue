<template lang="pug">
  v-row(align="center" justify="center")
    v-col(class="col-lg-6 col-xs-12")
      h1 {{$t("about.h1")}}
      h2 {{$t("about.h2")}}
      p {{$t("about.2p1")}}
      p {{$t("about.2p2")}}
      p {{$t("about.2p3")}}
      p {{$t("about.2p4")}}
      p {{$t("about.2p5")}}
      v-divider.wide_divider
      h2 {{$t("about.h3")}}
      p {{$t("about.3p1")}}
      p {{$t("about.3p2")}}
      v-divider.wide_divider
      h2#terms_of_use {{$t("about.h4")}}
      p {{$t("about.4p1")}}
      p {{$t("about.4p2")}}
      p {{$t("about.4p3")}}
      p {{$t("about.4p4")}}
      p {{$t("about.4p5")}}
      v-divider.wide_divider
      h2(id="privacy") {{$t("about.h5")}}
      h4 {{$t("about.h6")}}
      p {{$t("about.6p1")}}
      h4 {{$t("about.h7")}}
      p {{$t("about.7p1")}}
        span
          a(href="https://www.mapbox.com/legal/privacy") {{$t("about.mb_a")}}
    Footer
</template>

<script>
  import goToMiddleware from "~/components/global/goToMiddleware"
  import Footer from "~/components/global/Footer"

  export default {
    name: "about",
    components: {Footer},
    mixins: [goToMiddleware]
  }
</script>

<style scoped>

</style>
