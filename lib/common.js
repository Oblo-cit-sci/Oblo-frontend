import axios from 'axios'

export async function recent_entries() {
  return await axios.get(`http://localhost:5000/api/entry/recent`).then((res) => {
    return res.data;
  })
    .catch((e) => {
      return({ statusCode: 404, message: 'Post not found' })
    });
}
