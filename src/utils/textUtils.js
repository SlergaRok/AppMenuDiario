// Normaliza texto para comparaciones de búsqueda: minúsculas y sin tildes,
// así "lentejas" encuentra "Lentejas" y "pure" encuentra "puré".
export function normalizeText(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(text, query) {
  if (!query.trim()) return true;
  return normalizeText(text).includes(normalizeText(query));
}
