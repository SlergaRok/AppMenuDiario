import { Platform } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { OCR_SPACE_API_KEY } from "../config/ocrConfig";

export const isOcrConfigured = OCR_SPACE_API_KEY !== "TU_OCR_SPACE_API_KEY";

const OCR_ENDPOINT = "https://api.ocr.space/parse/image";
const MAX_WIDTH = 1600;

// El plan gratuito de OCR.space limita cada imagen a 1MB. Redimensionamos y
// recomprimimos antes de enviarla para no pasarnos y para que el
// reconocimiento vaya más rápido.
async function prepareImage(uri) {
  const rendered = await ImageManipulator.manipulate(uri).resize({ width: MAX_WIDTH }).renderAsync();
  return rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
}

// Sube la foto a OCR.space y devuelve el texto detectado en la imagen.
export async function extractTextFromImage(uri) {
  const { uri: preparedUri } = await prepareImage(uri);

  const formData = new FormData();
  formData.append("apikey", OCR_SPACE_API_KEY);
  formData.append("language", "spa");
  formData.append("OCREngine", "2");
  formData.append("scale", "true");
  formData.append("detectOrientation", "true");

  // En web, FormData necesita un Blob real; en nativo, React Native lo
  // resuelve a partir de un objeto {uri, name, type}.
  if (Platform.OS === "web") {
    const blob = await (await fetch(preparedUri)).blob();
    formData.append("file", blob, "recipe.jpg");
  } else {
    formData.append("file", { uri: preparedUri, name: "recipe.jpg", type: "image/jpeg" });
  }

  const response = await fetch(OCR_ENDPOINT, { method: "POST", body: formData });
  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    const message = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(" ") : data.ErrorMessage;
    throw new Error(message || "No se pudo procesar la imagen.");
  }

  const text = data.ParsedResults?.[0]?.ParsedText?.trim();
  if (!text) {
    throw new Error("No se detectó texto en la imagen.");
  }
  return text;
}
