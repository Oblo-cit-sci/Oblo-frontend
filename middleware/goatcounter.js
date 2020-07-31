// cant remove that for some weird reason


export default async function (context) {
  if (!process.server && !context.isDev) {
    const goatcounter = document.createElement("script")
    goatcounter.setAttribute("data-goatcounter", "https://opentek.goatcounter.com/count")
    goatcounter.setAttribute("async", "true");
    goatcounter.setAttribute("src", "//gc.zgo.at/count.js");
    let s = document.getElementsByTagName("script")[0]
    s.parentNode.insertBefore(goatcounter, s)
  }
}
