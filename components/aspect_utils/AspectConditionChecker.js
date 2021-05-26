import {aspect_loc_str2arr, attr, check_condition_value, check_single_condition, loc_prepend} from "~/lib/aspect";
import {recursive_unpack2} from "~/lib/util";
import {select_aspect_loc} from "~/lib/entry";
import {EDIT, ENTRY} from "~/lib/consts";

export default {
  name: "AspectConditionChecker",
  methods: {
    _condition_fail(aspect, aspect_loc, mode, entry_uuid, conditionals) {
      if (attr(aspect).hasOwnProperty("condition")) {
        return !this.check_recursive_condition(aspect.attr.condition, aspect_loc, mode, entry_uuid, conditionals)
      } else {
        return false
      }
    },
    check_recursive_condition(condition, aspect_loc, mode, entry_uuid, conditionals) {
      if (Array.isArray(condition)) {
        const method = condition[0].toLowerCase()
        if (condition.length < 2 || !["and", "or"].includes(method)) {
          console.log("Wrong condition format", condition)
        }
        const conditions = condition.slice(1)
        if (method === "and") {
          return conditions.every(c => this.check_recursive_condition(c, aspect_loc, mode, entry_uuid, conditionals))
        } else {
          return conditions.some(c => this.check_recursive_condition(c, aspect_loc, mode, entry_uuid, conditionals))
        }
      } else {
        return this.check_single_condition(condition, aspect_loc, mode, entry_uuid, conditionals)
      }
    },
    check_single_condition(condition, aspect_loc, mode, entry_uuid, conditionals) {
      let condition_value = null
      if (conditionals) {
        condition_value = recursive_unpack2(select_aspect_loc(null, aspect_loc_str2arr(condition.aspect), false, conditionals))
      } else if (aspect_loc) {
        let aspect_location = loc_prepend(mode ? EDIT : ENTRY, entry_uuid,
          aspect_loc_str2arr(condition.aspect))
        // console.log(aspect_location)
        condition_value = this.$store.getters["entries/value"](aspect_location)
      } else {
        console.log(`condition for aspect ... cannot be checked. no aspect_loc and no conditionals`)
        return false
      }
      // console.log("check_single_condition", this.aspect.name, "condition_value", condition_value, check_condition_value(condition_value, condition))
      return check_condition_value(condition_value, condition)
    }
  }
}
