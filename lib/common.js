export function get_location(cb) {
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(cb, (error) => {
      console.log("error obtaining location", error);
    });
  } else {
    console.log("no geolocation")
  }
}

export function create_options(option) {
  let optionType = typeof (option);
  let created_option = null;
  if (optionType === "string") {
    created_option = {
      title: option,
      slug: option
    };
  } else if (optionType === "object") {
    if (!option.hasOwnProperty("title")) {
      console.log("OPTIONS ARE MALFORME. MISSING TITLE:", option);
    } else if (!option.hasOwnProperty("slug")) {
      option.slug = option.title;
      created_option = {
        title: option.title,
        slug: option.title
      }
    } else {
      created_option = option;
    }
  } else {
    console.log("OPTIONS ARE MALFORME. WRONG TYPE:", option, optionType);
  }
  return created_option;
}


export function create_location_error(lon, lat, error) {
  //let a_error = error | 1;
  return {
    lon: lon + (Math.random() - 0.5) * error,
    lat: lat + (Math.random() - 0.5) * error
  }
}

