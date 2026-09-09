import { Alert, Platform } from "react-native";

// En react-native-web, Alert.alert() no hace nada (no hay implementación:
// ver node_modules/react-native-web/src/exports/Alert). Sin este wrapper,
// los avisos y las confirmaciones (borrar receta, salir del grupo...) serían
// invisibles en la versión web. Aquí los sustituimos por window.alert /
// window.confirm, manteniendo la misma firma que Alert.alert.
export function alert(title, message, buttons) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = [title, message].filter(Boolean).join("\n\n");

  if (!buttons || buttons.length === 0) {
    window.alert(text);
    return;
  }

  const cancelButton = buttons.find((b) => b.style === "cancel");
  const confirmButton = buttons.find((b) => b.style !== "cancel") || buttons[buttons.length - 1];

  if (window.confirm(text)) {
    confirmButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
