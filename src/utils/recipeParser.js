import { normalizeText } from "./textUtils";

const INGREDIENTS_HEADERS = ["ingredientes", "ingredients"];
const STEPS_HEADERS = [
  "preparacion",
  "elaboracion",
  "pasos",
  "instrucciones",
  "modo de preparacion",
  "modo de empleo",
  "procedimiento",
  "elaboracion paso a paso",
  "steps",
  "directions",
  "method",
];

function isHeaderLine(line, headers) {
  const normalized = normalizeText(line).replace(/[:.\-]+$/, "").trim();
  return headers.includes(normalized);
}

// Quita numeración ("1.", "2)"), guiones y viñetas del principio de línea,
// para no arrastrarlos al campo de la receta (la app ya numera los pasos).
function stripBullet(line) {
  return line.replace(/^\s*(?:[-•*]+|\d{1,2}[.)-])\s*/, "").trim();
}

// Reparte el texto detectado por OCR en ingredientes y pasos, buscando
// cabeceras típicas de receta ("Ingredientes", "Preparación"...). Si no
// encuentra ninguna, no puede separar con fiabilidad: devuelve todo como
// pasos para que el usuario lo revise y reparta a mano.
export function parseRecipeText(rawText) {
  const lines = (rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let section = null;
  const ingredientLines = [];
  const stepLines = [];
  const unassignedLines = [];

  for (const line of lines) {
    if (isHeaderLine(line, INGREDIENTS_HEADERS)) {
      section = "ingredients";
      continue;
    }
    if (isHeaderLine(line, STEPS_HEADERS)) {
      section = "steps";
      continue;
    }
    const cleaned = stripBullet(line);
    if (section === "ingredients") ingredientLines.push(cleaned);
    else if (section === "steps") stepLines.push(cleaned);
    else unassignedLines.push(cleaned);
  }

  if (!ingredientLines.length && !stepLines.length) {
    return { ingredients: "", steps: unassignedLines };
  }

  return {
    ingredients: ingredientLines.join("\n"),
    steps: stepLines.length ? stepLines : unassignedLines,
  };
}
