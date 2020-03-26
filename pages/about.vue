<template lang="pug">
  v-row(align="center" justify="center")
    v-col(class="col-lg-6 col-xs-12")
      h1 About OpenTEK
      div This is the first public release of the OPENTEK app.  OPENTEK is a free and open source platform to document and share Traditional Ecological Knowledge (TEK) related to biodiversity and climate change impacts. OPENTEK is designed as a progressive web-app (PWA) allowing users both to visualize existing geolocalized data and to collect new data. OPENTEK will be linked to two innovative citizen science projects documenting Indigenous and local knowledge around the world: CONECT-e (www.conecte.es) and LICCI (www.licci.eu). CONECT-e gathers and shares TEK related to plants and landraces, including traditional uses, management and local names. To address the local nature of TEK, the information entered in CONECT-e is geo-localized and can be visualized through maps. The information is also reviewed by a group of editors (i.e., scientists and TEK experts) and protected from misappropriation through a Creative Commons copyleft license[1]. LICCI gathers and shares information on local indicators of climate change impacts (e.g., changes in rainfall patterns or impacts of weather changes on wild animal abundance) under a structured format that will allow cross-site comparisons.
      div This application has received funding from the European Union’s Horizon 2020 research and innovation programme. The JRC, or as the case may be the European Commission, shall not be held liable for any direct or indirect, incidental, consequential or other damages, including but not limited to the loss of data, loss of profits, or any other financial loss arising from the use of this application, or inability to use it, even if the JRC is notified of the possibility of such damages.
      v-divider
      h2(id="privacy") Privacy Policy
      h4 Mapbox API
      div We are making use of the mapbox API for map display
      div APIs and Mobile SDKs: We automatically collect certain technical information whenever requests are made to our APIs, including (a) IP address, (b) device and browser information, (c) operating system, (d) the content of the request, (e) the date and time of the request, and (f) limited location and usage data. We delete IP addresses after 30 days. In addition, when a mobile application uses our SDKs to access our APIs, it may send us certain limited location and usage data along with an ephemeral ID. We delete this ephemeral ID within 24 hours and do not associate it or the unprocessed mobile location data with any personally identifying information, including names, permanent IDs, email addresses, IP addresses, or phone numbers. We also collect randomly-generated IDs for the limited purpose of analyzing the use of our APIs, including the number of active users. We will delete the randomly generated IDs and the content of requests made to our APIs after 36 months.‍
      div see more details here:
      span
        a(href="https://www.mapbox.com/legal/privacy") Mapbox Privacy policy

</template>

<script>
export default {
      name: "about",
}
</script>

<style scoped>

</style>
