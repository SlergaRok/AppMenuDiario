# Mi Menú Mensual 🍽️

Proyecto en **Expo SDK 54** (React Native 0.81, Android API 36).

App para crear recetas con foto y pasos, y planificar un menú mensual
compartido en familia. Funciona como app nativa (Android + iOS, vía Expo Go
o EAS Build) **y** como página web (por ejemplo en GitHub Pages, gratis), a
partir del mismo código. Los datos se guardan en **Firebase** (gratis) y se
sincronizan en tiempo real entre todos los dispositivos que se unan al mismo
grupo con un código compartido.

## Qué incluye

- **Pestaña Recetas**: crea, edita y elimina recetas, con foto (opcional),
  ingredientes, pasos y categoría (Comida, Cena o ambas). Buscador incluido.
- **Escanear receta desde una foto**: al crear/editar una receta, un botón
  rellena ingredientes y pasos automáticamente a partir de una foto (cámara
  en móvil, subir imagen en web) usando OCR. Requiere configurar una clave
  gratuita, ver [OCR_SETUP.md](./OCR_SETUP.md).
- **Pestaña Menú**: navega mes a mes (desde hoy en adelante) y elige, para
  cada día, qué receta toca de comida y cuál de cena. Al elegir, solo se
  muestran recetas de esa categoría, con buscador también.
- **Pestaña Grupo**: muestra el código para compartir con tu familia, la
  lista de miembros, y la opción de salir del grupo.
- **Sincronización en tiempo real**: cualquier cambio que haga alguien del
  grupo (añadir receta, cambiar el menú de un día...) aparece al instante
  en el resto de móviles.

## ⚠️ Antes de arrancar: configura Firebase (una sola vez)

Esta versión necesita una base de datos en la nube para poder compartir
datos entre dispositivos. Sigue la guía **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**
paso a paso (lleva unos 10 minutos, es gratis) antes de continuar. Sin eso,
la app no podrá conectar y verás un aviso de error al abrirla.

El escaneo de recetas (OCR) es opcional: sin configurarlo, todo lo demás
funciona igual, simplemente el botón de escanear avisará de que falta la
clave. Ver [OCR_SETUP.md](./OCR_SETUP.md) si quieres activarlo.

## 1. Requisitos previos

Instala en tu ordenador:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- La app **Expo Go** en tu móvil (búscala en Google Play o App Store) —
  es la forma más rápida de probar la app sin compilar nada todavía.
- Un proyecto de Firebase configurado (ver arriba).

## 2. Probar la app en tu móvil en minutos (sin compilar)

```bash
cd meal-planner
npm install
npx expo start
```

Esto abrirá una ventana en tu terminal con un código QR:

- **Android**: abre la app Expo Go y escanea el QR.
- **iOS**: abre la app de la Cámara y escanea el QR (te ofrecerá abrirlo
  en Expo Go).

La primera vez verás una pantalla para **crear un grupo nuevo** (te dará un
código para compartir con tu familia) o **unirte con un código** que te
haya pasado alguien. Cada persona solo tiene que hacer esto una vez en su
móvil; a partir de ahí queda recordado.

## 3. Compilarla como app instalable de verdad (.apk / .ipa)

Cuando quieras una app independiente (sin necesitar Expo Go, instalable
como cualquier otra), usa **EAS Build**, el servicio gratuito de Expo:

```bash
npm install -g eas-cli
eas login          # crea una cuenta gratuita en expo.dev si no tienes
eas build:configure

# Para Android (genera un .apk que puedes instalar directamente):
eas build --platform android --profile preview

# Para iOS necesitas una cuenta de Apple Developer (99$/año) para
# poder instalar en tu iPhone o subir a la App Store:
eas build --platform ios --profile preview
```

Cuando el build termine, EAS te da un enlace de descarga. Para Android
puedes instalar el `.apk` directamente en tu móvil. Para iOS, sin cuenta
de Apple Developer, la única forma de correr la app "nativa de verdad"
en tu iPhone es a través de Expo Go (paso 2), ya que Apple exige esa
cuenta para instalar apps fuera de la App Store.

## 4. Publicarla como web (GitHub Pages, gratis)

La misma app compila a una página web estática con `expo export -p web`.
El repo ya incluye un workflow de GitHub Actions
(`.github/workflows/deploy-web.yml`) que la publica sola en GitHub Pages
cada vez que subas cambios a `main`:

1. Sube este proyecto a un repositorio de GitHub.
2. En el repo, ve a **Settings → Pages → Build and deployment** y elige
   **Source: GitHub Actions**.
3. Añade `tuusuario.github.io` a los dominios autorizados de Firebase
   (ver el paso 5 de [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)), o el login
   fallará en la web.
4. Haz push a `main`. El workflow compila la web y la publica en
   `https://tuusuario.github.io/nombre-del-repo/`.

Para probarlo en tu ordenador antes de subirlo:

```bash
npm run build:web    # genera la carpeta dist/
npx serve dist        # o cualquier servidor estático
```

Nota: React Navigation no sincroniza la URL del navegador con la pantalla
actual (no hace falta para que la app funcione, pero recargar la página
siempre te devuelve a la pantalla inicial en vez de a la última que
visitaste).

## 5. Estructura del proyecto

```
meal-planner/
├── App.js                          # Punto de entrada
├── FIREBASE_SETUP.md               # Guía de configuración de Firebase
├── OCR_SETUP.md                    # Guía de configuración del escaneo de recetas
├── src/
│   ├── firebase/config.js          # Claves de conexión a tu proyecto Firebase
│   ├── config/ocrConfig.js         # Clave de OCR.space para escanear recetas
│   ├── context/
│   │   ├── HouseholdContext.js     # Grupo familiar: crear/unirse/miembros
│   │   └── DataContext.js          # Recetas y menú (Firestore, en tiempo real)
│   ├── navigation/AppNavigator.js  # Pestañas y navegación
│   ├── screens/
│   │   ├── JoinHouseholdScreen.js  # Pantalla de bienvenida (crear/unirse)
│   │   ├── GroupScreen.js          # Código, miembros, salir del grupo
│   │   ├── RecipesListScreen.js    # Lista de recetas + buscador
│   │   ├── RecipeFormScreen.js     # Crear/editar receta (foto + pasos + escaneo)
│   │   ├── RecipeDetailScreen.js   # Ver receta completa
│   │   ├── MonthlyMenuScreen.js    # Calendario mensual
│   │   └── DayMenuScreen.js        # Elegir receta para un día/comida
│   ├── components/
│   │   ├── RecipeCard.js           # Tarjeta reutilizable de receta
│   │   └── SearchBar.js            # Buscador reutilizable
│   └── utils/
│       ├── dateUtils.js            # Cálculo de días del mes
│       ├── textUtils.js            # Búsqueda sin tildes/mayúsculas
│       ├── householdCode.js        # Generar/normalizar código de grupo
│       ├── alert.js                # Alert.alert que también funciona en web
│       ├── share.js                # Share.share con fallback en web
│       ├── ocr.js                  # Llama a OCR.space y extrae el texto de la foto
│       └── recipeParser.js         # Reparte el texto en ingredientes/pasos
```

## 6. Ideas para ampliarla más adelante

- Lista de la compra automática combinando ingredientes del menú semanal.
- Copiar el menú de una semana a otra.
- Notificaciones cuando alguien cambia el menú.
- Migración automática de recetas guardadas con la versión local anterior.

Si quieres que añada alguna de estas funciones, dímelo y actualizo el código.
