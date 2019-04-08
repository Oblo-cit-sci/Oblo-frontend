export default function (context) {
  console.log("init middleware");
  context.userAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent;
  // console.log(context.userAgent);
  // console.log(context.store.state);

  if (!context.store.state.initialized) {
    context.$axios.get("/init").then((res) => {
      // TODO check if OK
      context.store.commit("init", res.data.result);
    }).catch((err) => {
      console.log("error getting initial data", err)
    })

    context.$axios.get("/get_related_users").then((res) => {
      // TODO check if OK
      context.store.commit("set_related_users", res.data.result);
    }).catch((err) => {
      console.log("error getting related users", err)
    })


  }
}
