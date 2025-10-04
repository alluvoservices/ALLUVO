/**
 * Mobile detection + layout switch.
 * - Uses UA Client Hints when available (navigator.userAgentData.mobile)
 * - Fallback to classic UA regex and width threshold
 * - Applies :root.is-mobile class when mobile
 * - Listens to resize to keep it in sync
 */
export function isMobileUA() {
  try {
    // Client Hints (Chromium)
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
      return navigator.userAgentData.mobile;
    }
  } catch {}
  // Classic UA check
  const ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
  const re = /(android|iphone|ipod|ipad|iemobile|blackberry|opera mini|mobile|fennec|webos)/i;
  return re.test(ua);
}

export function applyDeviceMode() {
  try {
    const root = document.documentElement;
    // Optional override for debugging: localStorage.uiMode = "mobile" | "desktop" | "auto"
    const forced = (localStorage.getItem("uiMode") || "auto").toLowerCase();
    const widthMobile = window.innerWidth <= 992;
    const useMobile = forced === "mobile" || (forced !== "desktop" && (isMobileUA() || widthMobile));
    root.classList.toggle("is-mobile", useMobile);
  } catch {}
}

export function installDeviceWatcher() {
  applyDeviceMode();
  // Re-evaluate on resize and after a tick
  window.addEventListener("resize", applyDeviceMode);
  setTimeout(applyDeviceMode, 0);
}

// Debug helper: run in console -> localStorage.uiMode='mobile'|'desktop'|'auto'; location.reload()
export function debugSetUiMode(mode = "auto") {
  try { localStorage.setItem("uiMode", mode); } catch {}
  try { applyDeviceMode(); } catch {}
}
