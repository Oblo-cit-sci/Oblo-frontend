import {PUBLIC} from "~/lib/consts"
import {can_edit_entry} from "~/lib/actors"
import {mapGetters} from "vuex"
import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
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
