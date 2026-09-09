# Configurar Firebase (una sola vez) 🔥

Esta app usa [Firebase](https://firebase.google.com) para sincronizar el menú
y las recetas entre todos los dispositivos de tu familia en tiempo real. Es
gratis para este uso (el plan gratuito de Firebase es de sobra para una
familia: miles de lecturas/escrituras al día y varios GB de fotos).

Solo tiene que configurarlo **una persona, una vez**. El resto de la familia
solo necesita el código de grupo (eso se hace desde la propia app, no aquí).

## 1. Crear el proyecto de Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y
   entra con tu cuenta de Google.
2. Pulsa **Crear proyecto**, ponle un nombre (ej. "Menu Familiar") y sigue el
   asistente. Puedes desactivar Google Analytics, no lo necesitamos.

## 2. Activar Firestore (la base de datos)

1. En el menú lateral, ve a **Compilación → Firestore Database**.
2. Pulsa **Crear base de datos**.
3. Elige **Modo producción** (no "modo de prueba").
4. Elige una ubicación cercana, por ejemplo `eur3 (europe-west)`.
5. Una vez creada, ve a la pestaña **Reglas** y sustituye todo el contenido
   por esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{code} {
      allow read, create, update: if request.auth != null;
      allow delete: if false;

      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

6. Pulsa **Publicar**.

> Esto permite leer y escribir a cualquiera que esté autenticado (aunque sea
> de forma anónima) y conozca el código exacto del grupo. El código de 6
> caracteres actúa como una "contraseña" del grupo: no es de nivel bancario,
> pero es más que suficiente para uso familiar (no es adivinable a mano ni
> aparece en ningún sitio público).

## 3. Activar Storage (para las fotos de las recetas)

1. Ve a **Compilación → Storage** y pulsa **Comenzar**.
2. Elige **Modo producción** y la misma ubicación que en Firestore.
3. Ve a la pestaña **Reglas** y sustituye el contenido por:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /households/{code}/recipeImages/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Pulsa **Publicar**.

## 4. Activar el inicio de sesión anónimo

1. Ve a **Compilación → Authentication** y pulsa **Comenzar**.
2. En la pestaña **Sign-in method**, pulsa **Anónimo** y actívalo.

Esto es lo que permite que cada móvil se identifique automáticamente sin
tener que crear cuentas, contraseñas ni pedir el email a nadie.

## 5. Si vas a publicar la versión web (GitHub Pages)

Firebase Authentication solo acepta peticiones desde dominios que tenga en
su lista blanca. Si vas a usar la app también desde el navegador (ver
"Publicarla como web" en el README), añade tu dominio de GitHub Pages:

1. Ve a **Compilación → Authentication → Settings → Authorized domains**.
2. Pulsa **Add domain** y añade `tuusuario.github.io` (sin la ruta del
   repositorio, solo el dominio).

Sin este paso, el inicio de sesión anónimo fallará con un error
`auth/unauthorized-domain` cuando abras la app desde GitHub Pages (en local
con `npx expo start --web` no hace falta, porque `localhost` ya está
autorizado por defecto).

## 6. Copiar la configuración a la app

1. Ve al icono de engranaje (⚙️) junto a "Descripción general del proyecto"
   → **Configuración del proyecto**.
2. Baja hasta **Tus apps** y pulsa el icono **`</>`** (Web) para añadir una
   app web (aunque nuestra app sea para móvil, Firebase usa esta misma
   configuración para todo).
3. Ponle un nombre (ej. "Mi Menú Mensual") y pulsa **Registrar app**. No
   hace falta marcar la casilla de Firebase Hosting.
4. Copia el objeto `firebaseConfig` que te muestra, algo así:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "menu-familiar-xxxxx.firebaseapp.com",
  projectId: "menu-familiar-xxxxx",
  storageBucket: "menu-familiar-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

5. Abre el archivo **`src/firebase/config.js`** de este proyecto y sustituye
   los valores de ejemplo (`"TU_API_KEY"`, etc.) por los tuyos.

## 7. Listo

Guarda el archivo, ejecuta `npx expo start -c` y abre la app. Verás la
pantalla de bienvenida para crear tu grupo familiar o unirte a uno con un
código. A partir de ahí, todo se sincroniza solo.

### Nota sobre datos anteriores

Si ya tenías recetas guardadas con una versión anterior de la app (la que
guardaba todo solo en el móvil, sin grupo), esas recetas no se migran
automáticamente al crear el grupo — hay que volver a crearlas dentro del
grupo nuevo. Si tienes muchas y quieres que te prepare una migración
automática, dímelo y la añado.
