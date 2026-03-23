# Deploy de CuadraFoto en Railway

## Resumen

CuadraFoto es una PWA frontend sin backend. El flujo correcto en Railway es:

1. construir con `pnpm build`
2. servir `dist/` con un servidor estático
3. mantener `HTTPS`, `manifest.webmanifest` y `sw.js` accesibles desde la raíz

La opción implementada en este repo usa un servidor Node mínimo en `scripts/serve-dist.mjs`. Evita dependencias extra como `serve` o `http-server`, respeta `PORT`, hace fallback SPA a `index.html` y aplica headers de cacheo razonables para PWA.

## Importante sobre Railway

En Railway, a fecha de `2026-03-22`, los servicios nuevos usan `Railpack` por defecto, no `Nixpacks`. Por eso el archivo [`railway.json`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/railway.json) fija explícitamente:

- builder: `RAILPACK`
- build command: `pnpm build`
- start command: `pnpm start`

Si tu servicio viejo sigue configurado con Nixpacks, los comandos de build y start de este repo siguen siendo válidos.

## Archivos usados

- [`railway.json`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/railway.json)
- [`package.json`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/package.json)
- [`scripts/serve-dist.mjs`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/scripts/serve-dist.mjs)

## Probar primero en local

Instalar dependencias:

```bash
pnpm install --no-frozen-lockfile
```

Construir:

```bash
pnpm build
```

Servir la build local:

```bash
PORT=4173 pnpm start
```

Abrir:

```txt
http://localhost:4173
```

## Qué hace el servidor de producción

- sirve `dist/index.html` en `/`
- sirve assets estáticos desde `dist/`
- devuelve `index.html` para rutas SPA sin extensión
- devuelve `404` para assets inexistentes
- usa `Cache-Control: no-cache` para:
  - `/`
  - `/index.html`
  - `/manifest.webmanifest`
  - `/sw.js`
  - `/registerSW.js`
  - `workbox-*.js`
- usa cache `immutable` para `/assets/*`

Eso permite que el app shell cacheado siga funcionando bien y que el service worker pueda actualizarse correctamente.

## Deploy en Railway desde GitHub

1. Haz push del repo a GitHub.
2. En Railway, crea un proyecto nuevo.
3. Elige `Deploy from GitHub repo`.
4. Conecta el repositorio de CuadraFoto.
5. Railway detectará el repo y leerá `railway.json`.
6. Verifica en Settings del servicio:
   - Builder: `Railpack`
   - Build Command: `pnpm build`
   - Start Command: `pnpm start`
7. Lanza el primer deploy.
8. Abre el dominio generado por Railway con `HTTPS`.

## Deploy en Railway CLI

Instalar CLI:

```bash
pnpm dlx @railway/cli login
```

Vincular el proyecto:

```bash
pnpm dlx @railway/cli link
```

Desplegar:

```bash
pnpm dlx @railway/cli up
```

## Variables o ajustes

No necesitas variables obligatorias para el MVP.

Railway inyecta `PORT` en runtime y `scripts/serve-dist.mjs` la usa automáticamente.

No hace falta backend, base de datos ni storage persistente para el editor.

## Alternativas para servir `dist`

### Opción recomendada en este repo

```bash
pnpm start
```

Ventajas:

- cero dependencias extra
- control directo de headers
- fallback SPA correcto
- comportamiento estable en Railway

### Opción con `serve`

Si prefieres una dependencia externa:

```bash
pnpm add serve
```

Start command:

```bash
pnpm exec serve -s dist -l tcp://0.0.0.0:$PORT
```

### Opción con `http-server`

```bash
pnpm add http-server
```

Start command:

```bash
pnpm exec http-server dist -p $PORT -a 0.0.0.0 -s
```

Para esta app no es la opción que dejé por defecto porque el servidor propio es más controlable para la PWA.

## Errores comunes

### `vite preview` en producción

No usar `vite preview` como servidor final. Sirve para revisar la build, no como runtime de producción en Railway.

### `404` al refrescar una ruta

Pasa cuando el servidor no hace fallback SPA a `index.html`. `scripts/serve-dist.mjs` ya lo resuelve.

### El service worker no actualiza

Suele pasar si `sw.js` o `index.html` quedan con cache fuerte. En este repo salen con `no-cache`.

### `Application failed to respond`

Suele pasar cuando el proceso no escucha en `0.0.0.0:$PORT`. El servidor incluido usa ambos correctamente.

### `manifest` o iconos no cargan

Revisa que:

- `manifest.webmanifest` exista en `dist/`
- `icons/` exista en `dist/`
- el dominio esté en `HTTPS`

## Validación offline después del deploy

1. Abre la app desplegada en el dominio de Railway.
2. Espera a que cargue completamente una vez online.
3. En escritorio:
   - abre DevTools
   - Application
   - Service Workers
   - confirma que `sw.js` está activo
4. En escritorio:
   - Network
   - activa `Offline`
   - recarga
   - la app debe abrir
5. En iPhone Safari:
   - abre la app online una vez
   - usa `Compartir > Agregar a pantalla de inicio`
   - abre desde el icono instalado
   - activa modo avión o corta red
   - vuelve a abrir
6. Verifica:
   - la UI carga
   - puedes seleccionar una imagen local
   - el editor funciona
   - la exportación sigue funcionando

## Checklist final

- `pnpm build` pasa localmente
- `PORT=4173 pnpm start` sirve la build sin errores
- Railway muestra deployment healthy
- el dominio público responde con `HTTPS`
- `manifest.webmanifest` carga
- `sw.js` carga
- la app abre offline tras la primera visita online
