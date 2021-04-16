<template lang="pug">
  div
    v-text-field(v-if="is_editable_mode" :prefix="prefix" v-model="i_value" :error="!input_valid" :rules="rules")
    div(v-else)
      div(v-if="value")
        div(itemscope itemtype="https://schema.org/Person")
          a(itemprop="sameAs" :content="repr" :href="repr" target="orcid.widget" rel="me noopener noreferrer" style="vertical-align:top;")
            img(src="https://orcid.org/sites/default/files/images/orcid_16x16.png" style="width:1em;margin-right:.5em;" alt="ORCID iD icon")
            span {{repr}}
      div(v-else) {{$t("comp.external_account_asp.not_given")}}
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin";

const services = ["orcid", "inaturalist"]

const prefixes = {
  "orcid": "https://orcid.org/"
}

const regexes = {
  "orcid": /^(\d){4}-(\d){4}-(\d){4}-(\d){3}[0-9a-z]$/
}

export default {
  name: "ExternalAccountAspect",
  mixins: [AspectComponentMixin],
  data() {
    return {
      i_value: null
    }
  },
  created() {
    if (!this.valid_service) {
      console.warn(`given service: ${this.service} is not valid. Choose from ${services}`)
    }
    this.i_value = this.value
  },
  computed: {
    service() {
      return this.attr.service
    },
    prefix() {
      if (this.valid_service) {
        return prefixes[this.service]
      } else
        return ""
    },
    valid_service() {
      return services.includes(this.service)
    },
    rules() {
      // todo language
      return [(value) => this.input_valid || this.$t("comp.external_account_asp.not_valid")]
    },
    input_valid() {
      if (this.valid_service) {
        if (this.service === "orcid") {
          return this.i_value === null ||  regexes[this.service].test(this.i_value)
        }
      }
      return false
    },
    repr() {
      if (this.valid_service) {
        if (this.input_valid) {
          return this.prefix + this.i_value
        }
      }
      return ""
    },
  },
  watch: {
    i_value(val) {
      if (this.valid_service) {
        if (this.input_valid) {
          this.update_value(val)
        }
      }
    },
    value(ext_val) {
      this.i_value = ext_val
    }
  }
}
</script>

<style scoped>

</style>
