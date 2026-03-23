# PWA y Offline

## Configuración final de `vite-plugin-pwa`

Archivo: [`vite.config.ts`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/vite.config.ts)

Puntos clave:

- estrategia `generateSW`
- `registerType: "autoUpdate"`
- `injectRegister: "auto"`
- manifest generado por el plugin
- `navigateFallback: "index.html"` para volver a abrir el app shell offline
- `cleanupOutdatedCaches: true`
- precache de `js`, `css`, `html`, `png`, `svg`, `ico` y `webmanifest`

## Estrategia de caché

CuadraFoto no tiene backend ni fetches críticos a APIs remotas. Por eso la estrategia correcta es:

- precachear el app shell completo
- no cachear imágenes del usuario
- no depender de runtime caching complejo

Resultado:

- la app vuelve a abrir sin conexión después de una carga previa exitosa
- la edición sigue funcionando offline porque ocurre 100% con `Canvas API`, `input file` y memoria local
- el `service worker` no interfiere con los archivos que el usuario selecciona desde el dispositivo

## Manifest pulido

El manifest queda generado por `vite-plugin-pwa` con:

- `name` y `short_name`
- `display: "standalone"`
- `orientation: "portrait"`
- `theme_color` y `background_color`
- `categories`
- íconos `192x192` y `512x512`
- ícono con `purpose: "any maskable"`

## Íconos necesarios

Archivos actuales:

- [`public/icons/apple-touch-icon.png`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/public/icons/apple-touch-icon.png)
- [`public/icons/icon-192.png`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/public/icons/icon-192.png)
- [`public/icons/icon-512.png`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/public/icons/icon-512.png)
- [`public/favicon-32.png`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/public/favicon-32.png)

Para iPhone, el más importante es `apple-touch-icon`.

## Instalación en iPhone

Safari en iPhone no muestra prompt automático estándar de instalación. El flujo esperado es:

1. abrir CuadraFoto en Safari con conexión
2. tocar `Compartir`
3. tocar `Agregar a pantalla de inicio`
4. abrir la app desde el icono instalado
5. volver a abrir una vez más para confirmar que el `service worker` ya tomó control

## Estado dentro de la app

La UI muestra:

- `Instalada` cuando la app corre en `standalone`
- `Lista offline` cuando el `service worker` ya está listo
- `Sin conexión` cuando `navigator.onLine` es `false`

## Checklist de validación offline

### En escritorio

1. ejecutar `pnpm build`
2. ejecutar `pnpm preview`
3. abrir la app
4. cargar una imagen local
5. mover, escalar y cambiar fondo
6. exportar en JPG y PNG
7. recargar una vez para confirmar que el `service worker` quedó activo
8. desactivar la red en DevTools
9. recargar la app
10. verificar que la interfaz siga abriendo
11. cargar otra imagen local y repetir edición y exportación

### En iPhone

1. desplegar en un origen `HTTPS`
2. abrir CuadraFoto en Safari con conexión
3. instalarla con `Compartir > Agregar a pantalla de inicio`
4. abrirla desde el icono instalado
5. confirmar que aparece `Instalada` o `Lista offline`
6. cerrar la app
7. activar modo avión o desactivar Wi-Fi y datos
8. volver a abrirla desde pantalla de inicio
9. verificar que abre sin conexión
10. seleccionar una imagen local desde Fotos o Archivos
11. editar y exportar

## Limitaciones razonables en Safari/iPhone

- la instalación es manual, no mediante prompt estándar
- la primera apertura offline solo funciona después de una carga online exitosa
- la exportación puede apoyarse en compartir o abrir archivo si la descarga directa no está disponible
- siempre hay que validar el flujo desde un `HTTPS` real en dispositivo
