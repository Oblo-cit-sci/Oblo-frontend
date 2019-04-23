import axios from 'axios'

export async function recent_entries() {
  console.log("calling recent_entries");
  return await axios.get(`http://localhost:5000/timeline`).then((res) => {
    return res.data;
  })
    .catch((e) => {
      return ({statusCode: 404, message: 'Post not found'})
    });
}

export function get_location(cb) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(cb);
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
      created_option= option;
    }
  } else {
    console.log("OPTIONS ARE MALFORME. WRONG TYPE:", option, optionType);
  }
  return created_option;
}

export function create_location_error(lon, lat, error) {
  return {
    lon : lon + (Math.random() - 0.5) * error,
    lat : lat + (Math.random() - 0.5) * error
  }
}




/*
export function get_location() {
  let location = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      location = position;
      return position;
    });
  } else {
    console.log("no geolocation")
  }
  return location;
}
*/
