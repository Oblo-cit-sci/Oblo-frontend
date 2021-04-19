// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;


function getPWADisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  if (document.referrer.startsWith('android-app://')) {
    return 'twa'
  } else if (navigator.standalone || isStandalone) {
    return 'standalone'
  }
  return 'browser'
}


export function set_prompt(prompt) {
  deferredPrompt = prompt
}

export function is_prompt_set() {
  return deferredPrompt !== null
}


export async function install_pwa() {
  try {
    // Hide the app provided install promotion
    hideInstallPromotion()
  } catch (e) {
    console.log("hideInstallPromotion not defined")
  }
  // Show the install prompt
  deferredPrompt.prompt()
  // Wait for the user to respond to the prompt
  const {outcome} = await deferredPrompt.userChoice
  // Optionally, send analytics event with outcome of user choice
  console.log(`User response to the install prompt: ${outcome}`);
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt = null
}


export function is_standalone() {
  return true // getPWADisplayMode() === "standalone"
}


