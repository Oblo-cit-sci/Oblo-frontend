const {set_prompt} = require("~/lib/pwa");

window.addEventListener('beforeinstallprompt', (e) => {
  console.log("beforeinstallprompt!!!")
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later.
  // deferredPrompt = e
  set_prompt(e)
  // Update UI notify the user they can install the PWA
  try {
    showInstallPromotion()
  } catch (e) {
    console.error(e)
  }
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`)
})
