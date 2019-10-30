<template lang="pug">
  v-row(align="center" justify="center")
    v-col(class="col-lg-6 col-xs-12")
      h1 About OpenTEK
      div This application has been developed within the EOVALUE project, which has received funding from the European Union’s Horizon 2020 research and innovation programme. The JRC, or as the case may be the European Commission, shall not be held liable for any direct or indirect, incidental, consequential or other damages, including but not limited to the loss of data, loss of profits, or any other financial loss arising from the use of this application, or inability to use it, even if the JRC is notified of the possibility of such damages.
      v-divider
      h2(id="privacy") Privacy Policy
      h4 Mapbox API
      div We are making use of the mapbox API for map display
      div APIs and Mobile SDKs: We automatically collect certain technical information whenever requests are made to our APIs, including (a) IP address, (b) device and browser information, (c) operating system, (d) the content of the request, (e) the date and time of the request, and (f) limited location and usage data. We delete IP addresses after 30 days. In addition, when a mobile application uses our SDKs to access our APIs, it may send us certain limited location and usage data along with an ephemeral ID. We delete this ephemeral ID within 24 hours and do not associate it or the unprocessed mobile location data with any personally identifying information, including names, permanent IDs, email addresses, IP addresses, or phone numbers. We also collect randomly-generated IDs for the limited purpose of analyzing the use of our APIs, including the number of active users. We will delete the randomly generated IDs and the content of requests made to our APIs after 36 months.‍
      div see more details here:
      span
        a(href="https://www.mapbox.com/legal/privacy") Mapbox Privacy policy
      h4 Use of webfonts
      div On these websites external fonts, Google fonts are used. Google Fonts is a service of Google Inc. (“Google”). The integration of these web fonts is done by a server call, usually a Google server in the USA. This will be transmitted to the server, which of our websites you have visited. Also, the IP address of the browser of the terminal of the visitor of this website is stored by Google. For more information, see the Google Privacy Policy, which you can access here:
      div
        a(href="www.google.com/fonts#AboutPlace:about") google.com/fonts
      div
        a(href="www.google.com/policies/privacy/") google.com/policies/privacy

</template>

<script>
export default {
      name: "about",
      mixins: [],
      components: {},
      props: {

      },
      data() {
          return {

          }
      },
      created() {

      },
      computed: {

      },
      methods: {

      },
      watch: {

      }
}
</script>

<style scoped>

</style>
