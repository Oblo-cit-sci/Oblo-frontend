import axios from 'axios'

export async function recent_entries() {
  return await axios.get(`http://localhost:5000/timeline`).then((res) => {

    return res.data;
  })
    .catch((e) => {
      return({ statusCode: 404, message: 'Post not found' })
    });
}

export function get_location() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      return position;
    });
  } else {
    console.log("no geolocation")
  }
}
