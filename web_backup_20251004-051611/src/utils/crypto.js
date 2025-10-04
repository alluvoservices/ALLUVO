export async function genKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
export async function importKey(raw) {
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}
export async function exportKey(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bufferToBase64(raw);
}
export async function encrypt(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { iv: bufferToBase64(iv), ct: bufferToBase64(buf) };
}
export async function decrypt(key, ivBase64, ctBase64) {
  const iv = base64ToBuffer(ivBase64);
  const ct = base64ToBuffer(ctBase64);
  const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(buf);
}
function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = ""; for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
function base64ToBuffer(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
