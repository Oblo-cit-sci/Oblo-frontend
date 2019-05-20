export default function (context) {

  // this part is now in the index page
  // console.log("init middleware");
  context.userAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent;

  /*
  if (process.server) {
    if (!context.store.state.initialized) {
      //console.log(context.$axios.defaults.headers);
      context.$axios.get("/init").then((res) => {
        // TODO check if OK
        context.store.commit("init", res.data.result);
        //console.log(res.data.result.user.user_data);
        if (res.data.result.user.user_data !== undefined) {
          console.log("middleware login")
          context.store.commit("login", res.data.result.user.user_data);
        }
        //console.log(context.store.state.logged_in);
      }).catch((err) => {
        console.log("error getting initial data", err)
      });


      /* TODO should be from login data
      context.$axios.get("/get_related_users").then((res) => {
        // TODO check if OK
        context.store.commit("set_related_users", res.data.result);
      }).catch((err) => {
        console.log("error getting related users", err)
      })*/

}
