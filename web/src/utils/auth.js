export function setAuthSession(data) {
  try {
    localStorage.setItem("token", data.token);
    if (data.activeId && Array.isArray(data.profiles) && data.profiles.length) {
      const p = data.profiles.find(x => x.id === data.activeId) || data.profiles[0];
      localStorage.setItem("activeProfile", JSON.stringify(p));
      const idx = data.profiles.findIndex(x => x.id === data.activeId);
      if (idx >= 0) localStorage.setItem("activeProfileIndex", String(idx + 1));
    }
  } finally {
    window.dispatchEvent(new Event("auth-changed"));
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("activeProfile");
    localStorage.removeItem("activeProfileIndex");
    // Clear any chat keys
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("roomKey:")) localStorage.removeItem(k);
    });
  } finally {
    window.dispatchEvent(new Event("auth-changed"));
  }
}
