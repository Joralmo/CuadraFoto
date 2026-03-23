# CuadraFoto

Base de proyecto para una PWA mobile-first hecha con `Vite + React + TypeScript + Tailwind CSS + vite-plugin-pwa`.

## Stack

- `Vite`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `vite-plugin-pwa`

## Estructura inicial

```txt
public/
  icons/
  assets/
  favicon-32.png
  manifest.webmanifest

src/
  app/
  components/
  features/
    pwa/
    upload/
  styles/
  main.tsx
```

## Instalar dependencias

```bash
pnpm install --no-frozen-lockfile
```

## Ejecutar en desarrollo

```bash
pnpm dev
```

La app quedará disponible por defecto en:

```txt
http://localhost:5173
```

## Probar desde otro dispositivo en la misma red

```bash
pnpm dev -- --host
```

Luego abre en el iPhone la URL que muestre Vite usando la IP local de tu máquina.

## Crear build de producción

```bash
pnpm build
```

El resultado se genera en:

```txt
dist/
```

## Previsualizar la build

```bash
pnpm preview
```

La preview quedará por defecto en:

```txt
http://localhost:4173
```

## Nota importante para Safari/iPhone

- Puedes probar la UI desde iPhone con `pnpm dev -- --host`.
- Para probar `offline`, `service worker` y la instalación real como PWA en iPhone, necesitas abrir la app desde un origen `HTTPS`.
- En Safari iPhone, la instalación se hace desde `Compartir > Agregar a pantalla de inicio`.

## PWA y offline

La configuración y checklist de validación quedaron documentados en:

- [`docs/pwa-offline.md`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/docs/pwa-offline.md)
- [`docs/railway-deploy.md`](/Volumes/JoralmoProSSD500/Documents/Proyectos/CuadraFoto/docs/railway-deploy.md)

## Scripts disponibles

```bash
pnpm dev
pnpm build
pnpm preview
pnpm check
pnpm start
```
