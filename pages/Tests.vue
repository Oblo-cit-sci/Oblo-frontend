<template lang="pug">
  div
    v-btn(@click="call") call
    SimpleTextView(:title="result.title" :text_parts="result.text_parts")
</template>

<script>

  import SelectGrid from "../components/aspect_utils/SelectGrid";

  import LargeSelectList from "../components/aspect_utils/LargeSelectList"
  import SimpleExpansionPanel from "~/components/util/SimpleExpansionPanel"
  import SimpleTextView from "~/components/aspect_utils/SimpleTextView"

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {SimpleTextView, SimpleExpansionPanel, LargeSelectList, SelectGrid},
    mounted() {
    },
    created() {
      this.call()
    },
    data() {
      return {
        "action": {
          "type": "api-query",
          "name": "crossref-query",
          "trigger": {
            "type": "button",
            "button_label": "retrieve Metadata"
          },
          "properties": {
            "query_url": "https://api.crossref.org/v1/works/",
            "method": "get",
            "value_emit": "url_attach",
            "result": {
              "publisher": "message.publisher",
              "author": ["message.author", ["family", "given"]],
              "type": "message.type",
              "volume": "message.volume"
            }
          }
        },
        "result": {}
      }
    },
    computed: {},
    methods: {
      handleResponse(data) {
        const properties = this.action.properties
        const value = "10.14430/arctic174"

        console.log("done", data)
        const result = []
        for (let k in properties.result) {
          let read = null
          // if value is just str, the string is the location of a simple value
          // if value is array, first is location, probably to an object, and the 2nd is how the keys are "joined"
          let joined = false
          if (this.$_.isArray(properties.result[k])) {
            read = this.$_.get(data, properties.result[k][0])
            joined = true
          } else {
            read = this.$_.get(data, properties.result[k])
          }
          if (read) {
            if (joined) {
              debugger
              const join_obj = (val) => {
                const keys_to_join = properties.result[k][1]
                return this.$_.map(keys_to_join, k => val[k]).join(", ")
              }
              if (Array.isArray(read)) {
                read = read.map(v => join_obj(v))
              } else {
                read = join_obj(v)
              }
            }
            result.push({[k]: read})
          }
        }
        console.log("res", result)
        this.result = {
          title: "Metadata",
          text_parts: result
        }
      },
      call() {
        let url = "https://api.crossref.org/v1/works/"
        const properties = this.action.properties
        const value = "10.14430/arctic174"
        //
        if (properties.value_emit === "url_attach") {
          url += value
        }

        const response = {
          "status": "ok", "message-type": "work", "message-version": "1.0.0", "message": {
            "indexed": {"date-parts": [[2020, 3, 30]], "date-time": "2020-03-30T07:44:25Z", "timestamp": 1585554265751},
            "reference-count": 0,
            "publisher": "The Arctic Institute of North America",
            "issue": "4",
            "content-domain": {"domain": [], "crossmark-restriction": false},
            "short-container-title": ["ARCTIC"],
            "DOI": "10.14430\/arctic174",
            "type": "journal-article",
            "created": {"date-parts": [[2014, 2, 24]], "date-time": "2014-02-24T22:04:01Z", "timestamp": 1393279441000},
            "source": "Crossref",
            "is-referenced-by-count": 11,
            "title": ["Advancing Landscape Change Research through the Incorporation of I\u00f1upiaq Knowledge"],
            "prefix": "10.14430",
            "volume": "62",
            "author": [{
              "given": "Wendy R.",
              "family": "Eisner",
              "sequence": "first",
              "affiliation": []
            }, {
              "given": "Chris J.",
              "family": "Cuomo",
              "sequence": "additional",
              "affiliation": []
            }, {
              "given": "Kenneth M.",
              "family": "Hinkel",
              "sequence": "additional",
              "affiliation": []
            }, {
              "given": "Benjamin M.",
              "family": "Jones",
              "sequence": "additional",
              "affiliation": []
            }, {"given": "Ronald H.", "family": "Brower, Sr.", "sequence": "additional", "affiliation": []}],
            "member": "5550",
            "published-online": {"date-parts": [[2009, 11, 24]]},
            "container-title": ["ARCTIC"],
            "original-title": [],
            "deposited": {
              "date-parts": [[2019, 3, 5]],
              "date-time": "2019-03-05T17:11:58Z",
              "timestamp": 1551805918000
            },
            "score": 1.0,
            "subtitle": [],
            "short-title": [],
            "issued": {"date-parts": [[2009, 11, 24]]},
            "references-count": 0,
            "journal-issue": {"published-online": {"date-parts": [[2009, 11, 24]]}, "issue": "4"},
            "URL": "http:\/\/dx.doi.org\/10.14430\/arctic174",
            "relation": {},
            "ISSN": ["1923-1245", "0004-0843"],
            "issn-type": [{"value": "0004-0843", "type": "print"}, {"value": "1923-1245", "type": "electronic"}]
          }
        }
        this.handleResponse(response)
        // axios.request({
        //   url: url,
        //   method: this.$_.get(properties, "method", "get")
        // }).then(({data}) => ).catch(err => {
        //   console.log(err)
        // })
      }
    }
  }
</script>

<style scoped>

</style>
