# Configurar el escaneo de recetas (OCR.space) 📷

La app puede rellenar ingredientes y pasos automáticamente a partir de una
foto de una receta (en móvil, con la cámara; en web, subiendo una imagen).
Para eso usa [OCR.space](https://ocr.space/ocrapi), un servicio de OCR con
un plan gratuito (hasta 500 peticiones al día, sin tarjeta) que se llama
directamente desde la app, sin necesitar servidor propio.

Solo hace falta configurarlo **una vez**.

## 1. Consigue una clave gratuita

1. Ve a [ocr.space/ocrapi](https://ocr.space/ocrapi) y pulsa **Free API Key**.
2. Rellena tu email y pulsa el botón de registro. Te llegará la clave al
   correo al momento (algo así como `K8xxxxxxxxxxxxx`).

## 2. Pégala en la app

Abre **`src/config/ocrConfig.js`** y sustituye el valor de ejemplo:

```js
export const OCR_SPACE_API_KEY = "K8xxxxxxxxxxxxx"; // tu clave real
```

## 3. Listo

Guarda el archivo y reinicia la app (`npx expo start -c`). Al crear o editar
una receta verás un botón para escanearla desde una foto.

## Cómo funciona y sus límites

- El texto se reparte en ingredientes/pasos buscando cabeceras típicas
  ("Ingredientes", "Preparación", "Pasos"...). Si la foto no las tiene, todo
  el texto detectado se vuelca en "Pasos" para que lo repartas a mano.
- Funciona mejor con texto impreso, claro y bien iluminado; el
  reconocimiento puede fallar con letra manuscrita o fotos borrosas — revisa
  siempre el resultado antes de guardar.
- Al ser un servicio gratuito compartido, respeta un límite de tamaño por
  imagen (1MB); la app ya redimensiona la foto automáticamente antes de
  enviarla, así que no tienes que preocuparte por esto.
- Esta clave se guarda en el código y viaja con la app (también en la
  versión web, visible en el navegador para quien mire el código fuente).
  Al ser una clave del plan gratuito, sin datos de pago asociados, el único
  riesgo real es que alguien la use y agote tu cuota diaria — si pasara,
  basta con generar otra clave gratuita y sustituirla.
