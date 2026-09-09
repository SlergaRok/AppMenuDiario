// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/L) para que el código
// sea fácil de leer y escribir a mano entre familiares.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateHouseholdCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

// Normaliza lo que el usuario escribe: mayúsculas, sin espacios,
// para que "ab3f 9k" y "AB3F9K" se traten como el mismo código.
export function normalizeCode(code) {
  return (code || "").toString().trim().toUpperCase().replace(/\s+/g, "");
}
