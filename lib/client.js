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


export function complete_activities(entryType, step, aspect_values) {
  /*
  curcial symbols:
  #Bla refers to the aspect value.
  depending on the type, it will select, slug:... or uuid:...
  BUT THIS IS HAPPENEING ON THE SERVER SO, THEY STAY

  @self
  is the user: so it will insert: registered_name
  although again, the server can take care of that. maybe it verifies

  this.... can modify the data model e.g. assigning reviewers, owners, ...


  step: says what triggered the activity (e.g. send)
  */
  console.log("complete!", entryType, aspect_values);

  if(!entryType.content.hasOwnProperty("activities")){

    return {}
  } else {
    !entryType.content.activities.hasOwnProperty(step)
    // here more processing?
    return entryType.content.activities[step];
  }
}
