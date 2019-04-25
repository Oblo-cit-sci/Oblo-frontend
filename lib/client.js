import Basic from "~~/components/aspectInput/Basic";
import TextShort from "~~/components/aspectInput/TextShort";
import IntAspect from "~~/components/aspectInput/IntAspect";
import TextLong from "~~/components/aspectInput/TextLong";
import DateAspect from "~~/components/aspectInput/DateAspect";
import Location from "~~/components/aspectInput/Location";
import ListOf from "~~/components/aspectInput/ListOf";
import SelectUser from "~~/components/aspectInput/SelectUser";


export function MAspectComponent(aspect)  {
  if (aspect.type === "str") {
    let attributes = aspect.attr || {};
    let max = attributes.max || 8000; // or make this explicit in python
    if (max < 100) {
      return TextShort;
    } else {
      return TextLong;
    }
  } else if (aspect.type === "int") {
    console.log("int aspect");
    return IntAspect;
  } else if (aspect.type === "@user") {
    return SelectUser;
  } else if (aspect.type === "date") {
    return DateAspect;
  } else if (aspect.type === "gps") {
    return Location;
  } else if (aspect.type === "list") {
    return ListOf
  }
  return Basic;
}
