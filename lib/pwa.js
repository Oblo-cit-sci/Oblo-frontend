// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;


export function is_standalone() {
  const matchMedia = window.matchMedia('(display-mode: standalone)').matches
  const nav_standalone = window.navigator.standalone
  const ref_android = document.referrer.startsWith('android-app://')
  return matchMedia || nav_standalone || ref_android
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

