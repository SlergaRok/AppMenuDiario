import { Share, Platform } from "react-native";
import { alert } from "./alert";

// En navegadores de escritorio (Chrome/Firefox en Windows, por ejemplo)
// no existe navigator.share, así que Share.share de react-native-web
// simplemente rechaza la promesa. Aquí copiamos el texto al portapapeles
// como alternativa en vez de dejar que el botón "Compartir" no haga nada.
export async function shareText(message) {
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch (e) {
        // El usuario canceló el share
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      alert("Copiado", "El código se ha copiado al portapapeles.");
      return;
    }
    alert("Compartir código", message);
    return;
  }

  try {
    await Share.share({ message });
  } catch (e) {
    // El usuario canceló el share
  }
}
