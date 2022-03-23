import {FLOAT, INT} from "~/lib/consts";
import {attr} from "~/lib/aspect";

export default {
  name: "AspectValueValidation",
  methods: {
    aspect_value_validation(aspect, raw_value) {
      if ([INT, FLOAT].includes(aspect.type)) {
        if (attr(aspect).min !== undefined && raw_value < aspect.attr.min) {
          return "<"
        } else if (attr(aspect).max !== undefined && raw_value > aspect.attr.max) {
          return ">"
        }
      }
      return null
    }
  }
}
