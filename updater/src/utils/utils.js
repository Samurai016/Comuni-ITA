export const header = `
   _____                            _   _____ _______       
  / ____|                          (_) |_   _|__   __|/\\    
 | |     ___  _ ___ __  _   _ _ __  _    | |    | |  /  \\   
 | |    / _ \\| '_ \`_  \\| | | | '_ \\| |   | |    | | / /\\ \\  
 | |___| (_) | | | | | | |_| | | | | |  _| |_   | |/ ____ \\ 
  \\_____\\___/|_| |_| |_|\\__,_|_| |_|_| |_____|  |_/_/    \\_\\

`;

export function capitalize() {
  return this.split(" ")
    .map((chunk) => {
      return chunk.substring(0, 1).toUpperCase() + chunk.substring(1).toLowerCase();
    })
    .join(" ");
};

export function getCoords(point) {
  const match = /Point\((.+) (.+)\)/gm.exec(point);
  return match
    ? {
      lng: match[1],
      lat: match[2],
    }
    : {};
};

export function sanitizeProvincia(name) {
  const match = /(.+)\/.+/.exec(name);
  return (match ? match[1] : name)?.trim();
};
export function sanitizeRegione(name) {
  return sanitizeProvincia(name)?.replaceAll("-", " ");
};
export function sanitizeCap(cap) {
  const match = /^"?(?<cap>\d+)/.exec(cap);
  return match ? match[1] : cap;
};
export function sanitizePrefisso(prefisso) {
  const match = /^\d+/.exec(prefisso?.trim());
  return match ? match[0] : prefisso?.trim();
};
export function sanitizeEmail(email) {
  if (!email) return null;
  return email?.trim().replaceAll("/", "").replaceAll(" ", "");
};
export function sanitizeTelefono(numero) {
  if (!numero) return null;
  return numero.trim();
};
export function sanitizeCoordinata(coordinata) {
  if (!coordinata) return null;
  return coordinata.trim().replaceAll(",", ".");
};
export function sanitizeName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("-", "")
    .replaceAll(" ", "")
    .replaceAll("'", "");
};

export function sanitizeForTelegram(text) {
  const escapes = ["!", "-", "."];
  for (let i = 0; i < escapes.length; i++) {
    text = text.replaceAll(escapes[i], `\\${escapes[i]}`);
  }
  return text;
};
