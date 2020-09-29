import DomainData_UtilMixin from "~/components/domain/DomainData_UtilMixin"

export default {
  name: "DomainDataMixin",
  mixins: [DomainData_UtilMixin],
  props: {
    domain_data: {
      type: Object,
      required: true
    }
  }
}
