# CuadraFoto

## Documento Base del Proyecto

Estado: `MVP definido`

Versión: `1.0`

Fecha: `2026-03-22`

Propósito de este archivo: servir como fuente de verdad para futuras instrucciones de producto, diseño e implementación.

---

## 1. PRD Técnico

### 1.1 Resumen del producto

CuadraFoto es una app web PWA, mobile-first y local-first, que permite convertir una imagen vertical u horizontal en una composición cuadrada `1:1` lista para publicar en Instagram u otras redes.

La imagen original se mantiene como capa principal y el espacio restante se completa con una de dos estrategias:

- fondo difuminado basado en la misma imagen
- color sólido

El procesamiento debe ocurrir `100% en el navegador`, sin backend en el MVP y con soporte offline una vez cargada o instalada la app.

### 1.2 Problema que resuelve

Muchos usuarios tienen fotos en formato vertical u horizontal que no encajan bien en publicaciones cuadradas. Las soluciones actuales suelen ser lentas, complejas, invasivas o dependen de subir la imagen a un servidor. CuadraFoto resuelve ese caso de uso con una sola tarea clara, rápida y privada.

### 1.3 Objetivo del MVP

Permitir que una persona:

1. suba una imagen JPG, JPEG o PNG
2. vea una preview cuadrada en tiempo real
3. mueva y escale la imagen principal
4. elija fondo blur o color
5. ajuste la intensidad del blur
6. elija un color dominante sugerido o un color manual
7. exporte el resultado final en PNG o JPG con buena calidad

### 1.4 Metas del producto

- Resolver un único flujo de edición de forma excelente
- Ser usable y rápida en iPhone desde Safari
- Funcionar offline después de la primera carga
- No enviar imágenes a servidores
- Mantener una UI simple y táctil

### 1.5 No metas del MVP

- Convertirse en un editor generalista
- Gestionar cuentas de usuario
- Sincronizar proyectos entre dispositivos
- Ofrecer edición multicapa o plantillas complejas

### 1.6 Usuario objetivo

Personas que quieren adaptar una foto a formato cuadrado para Instagram de manera rápida desde el celular, sin instalar software pesado y sin exponer sus archivos a terceros.

### 1.7 Caso de uso principal

Una persona toma o selecciona una foto vertical, la abre en CuadraFoto, ajusta encuadre y fondo, y la descarga lista para publicar.

### 1.8 Requisitos funcionales

#### Carga y validación

- Permitir cargar archivos `JPG`, `JPEG` y `PNG`
- Mostrar error claro si el formato no es compatible
- Validar que el archivo pueda decodificarse correctamente
- Corregir orientación usando metadatos EXIF cuando aplique

#### Edición

- Generar automáticamente una composición cuadrada al cargar la imagen
- Mostrar una preview inmediata del resultado
- Permitir mover la imagen principal en ambos ejes
- Permitir escalar la imagen principal con gesto o slider
- Mantener la proporción original de la imagen principal
- Resetear posición y escala a valores razonables

#### Fondo

- Permitir alternar entre `blur` y `color`
- En modo blur, generar un fondo basado en la misma imagen
- En modo blur, permitir ajustar intensidad
- En modo color, mostrar una paleta sugerida extraída de la imagen
- En modo color, permitir elegir un color manual con input nativo

#### Exportación

- Permitir exportar en `PNG`
- Permitir exportar en `JPG`
- Permitir ajustar calidad para JPG
- Mantener una resolución de salida suficiente para redes sociales
- Generar un archivo descargable con nombre predecible

#### Persistencia local

- Recordar localmente el último modo de fondo
- Recordar localmente el último nivel de blur
- Recordar localmente el último formato de exportación
- Recordar localmente la última calidad JPG usada
- Recordar localmente el último color manual usado

### 1.9 Requisitos no funcionales

#### Privacidad

- Ninguna imagen debe salir del dispositivo durante el procesamiento
- No debe existir backend en el MVP
- No deben existir llamadas a APIs de terceros para editar o analizar imágenes

#### Compatibilidad

- Prioridad máxima: `Safari en iPhone`
- Compatibilidad objetivo adicional: Chrome, Edge y Safari de escritorio modernos
- La experiencia debe degradar con gracia si alguna capacidad avanzada no está disponible

#### Rendimiento

- La preview inicial debe aparecer rápidamente después de cargar la imagen
- La interacción de mover y escalar debe sentirse fluida en dispositivos móviles recientes
- La app debe evitar consumos excesivos de memoria con imágenes grandes

#### Offline

- La app debe cargar recursos críticos desde caché después de la primera visita
- El editor debe seguir funcionando sin conexión una vez el shell haya sido cacheado
- No debe depender de red para la edición ni exportación

#### Calidad de imagen

- La exportación debe verse nítida en usos típicos de redes sociales
- La preview y la exportación final deben coincidir visualmente de forma razonable

#### Accesibilidad

- Controles táctiles con tamaño cómodo
- Contraste suficiente en textos y botones
- Labels claros para input de archivo, sliders y exportación

### 1.10 Restricciones técnicas

- MVP sin backend
- MVP sin autenticación
- Procesamiento exclusivamente en cliente
- Debe ser instalable en iPhone vía `Share > Add to Home Screen` desde Safari
- Debe funcionar como PWA con `manifest` y `service worker`

### 1.11 Supuestos

- El usuario trabaja con una sola imagen a la vez
- No se necesita historial persistente de proyectos en el MVP
- Un tamaño de exportación por defecto entre `1080x1080` y `1440x1440` será suficiente para la mayoría de casos
- El blur se implementará con Canvas 2D y una estrategia compatible con Safari

### 1.12 Métricas de éxito del MVP

- El usuario puede completar el flujo completo sin ayuda
- El tiempo entre carga y primera preview es percibido como inmediato en condiciones normales
- La exportación final mantiene calidad aceptable para publicación social
- La app sigue siendo usable sin conexión tras la primera carga

---

## 2. Funcionalidades MVP

### Incluidas

- Selección de imagen desde dispositivo
- Soporte para `JPG`, `JPEG` y `PNG`
- Preview cuadrado en tiempo real
- Reencuadre con drag
- Escalado de imagen principal
- Fondo blur basado en la misma imagen
- Control de intensidad del blur
- Fondo de color sólido
- Extracción de colores dominantes sugeridos
- Selección de color sugerido
- Selección de color manual
- Exportación en `PNG`
- Exportación en `JPG`
- Control de calidad para JPG
- Persistencia local de preferencias simples
- PWA instalable
- Soporte offline

### Defaults recomendados del MVP

- Modo inicial: último modo usado o `blur`
- Blur inicial: valor medio visualmente útil
- Escala inicial: encaje óptimo para que la imagen principal sea protagonista
- Exportación inicial: `JPG` de alta calidad
- Tamaño inicial de salida: `1080x1080`

---

## 3. Funcionalidades Fuera de Alcance

- Backend o API propia
- Login, cuentas o perfiles
- Guardado de proyectos en la nube
- Historial completo de ediciones
- Edición por lotes
- Múltiples formatos sociales en el primer release
- Filtros fotográficos avanzados
- Herramientas de texto, stickers o marcos
- IA generativa
- Relleno inteligente por contenido
- Eliminación de fondo
- Compartir directo a Instagram mediante integraciones nativas
- Sincronización entre dispositivos
- Analítica avanzada
- Internacionalización multiidioma en el MVP

---

## 4. Arquitectura Frontend Recomendada

### 4.1 Stack

- `Vite` para bundling y dev server
- `React` con `TypeScript`
- `Tailwind CSS` para UI rápida y consistente
- `vite-plugin-pwa` para manifest y service worker
- `Canvas API 2D` para composición y exportación
- `localStorage` para preferencias simples

### 4.2 Enfoque de arquitectura

Arquitectura frontend modular, centrada en un `single-screen editor`, con separación entre:

- UI y controles
- estado de edición
- pipeline de imagen
- exportación
- persistencia local
- capa PWA

### 4.3 Recomendación de estado

Para el MVP, usar estado local de React más un `useReducer` o store ligero para el editor. No introducir una solución de estado compleja si el dominio sigue siendo de una sola pantalla.

Estado mínimo del editor:

- `sourceImage`
- `imageMetadata`
- `canvasSize`
- `positionX`
- `positionY`
- `scale`
- `backgroundMode`
- `blurIntensity`
- `selectedColor`
- `suggestedColors`
- `exportFormat`
- `jpgQuality`

### 4.4 Módulos principales

#### App Shell

Responsable de bootstrap, layout principal, instalación PWA y registro del service worker.

#### Upload

Responsable de selección de archivo, validación básica, decodificación inicial y normalización de metadatos.

#### Editor

Responsable de la preview, drag, zoom, reset y sincronización con el estado del documento.

#### Background Engine

Responsable de renderizar:

- fondo blur
- fondo color
- capa principal

#### Palette Extraction

Responsable de obtener colores dominantes útiles para UI y fondo color.

#### Export

Responsable de generar el archivo final en PNG o JPG con la configuración elegida.

#### Preferences

Responsable de lectura y escritura tolerante a fallos en `localStorage`.

### 4.5 Pipeline de imagen recomendado

1. el usuario selecciona archivo
2. se valida el tipo MIME y extensión
3. se decodifica la imagen
4. se corrige orientación si aplica
5. se genera metadata base
6. se extrae paleta sugerida
7. se renderiza preview en canvas
8. cambios de controles disparan rerender del preview
9. exportación usa el mismo pipeline de composición con tamaño final

### 4.6 Estrategia de render

- Usar un canvas para preview y otro flujo de render para exportación final
- Mantener una sola función pura de composición que reciba estado y dimensiones
- Reutilizar la misma lógica tanto para preview como para export para evitar divergencias visuales
- Aplicar throttling suave o `requestAnimationFrame` a interacciones continuas si fuera necesario

### 4.7 Estrategia PWA

- Cachear `app shell`, assets estáticos y rutas críticas
- No cachear imágenes del usuario como parte del service worker
- Mantener modo offline centrado en recursos de la app
- Incluir `manifest.webmanifest` con nombre, íconos, `display: standalone` y colores de marca

### 4.8 Estrategia de compatibilidad iPhone

- Priorizar APIs ampliamente soportadas por Safari
- Evitar dependencias que requieran WebGL o APIs experimentales para el flujo base
- Probar descarga y share sheet específicamente en iPhone
- Diseñar la instalación bajo el modelo real de Safari: agregar a pantalla de inicio desde el menú de compartir

---

## 5. Estructura de Carpetas

```txt
src/
  app/
    App.tsx
    providers.tsx
  components/
    Button.tsx
    Slider.tsx
    SegmentedControl.tsx
    ColorSwatch.tsx
    Field.tsx
  features/
    upload/
      UploadSection.tsx
      upload.types.ts
    editor/
      EditorScreen.tsx
      PreviewCanvas.tsx
      TransformControls.tsx
      BackgroundControls.tsx
      editor.reducer.ts
      editor.types.ts
    palette/
      PaletteSuggestions.tsx
      usePalette.ts
    export/
      ExportPanel.tsx
      export.types.ts
    preferences/
      usePreferences.ts
      preferences.storage.ts
    pwa/
      InstallHint.tsx
      pwa.ts
  lib/
    canvas/
      composeSquareImage.ts
      drawBlurBackground.ts
      drawColorBackground.ts
      drawMainImage.ts
      exportCanvas.ts
    image/
      decodeImageFile.ts
      normalizeOrientation.ts
      getImageMetadata.ts
    colors/
      extractDominantColors.ts
      normalizePalette.ts
    storage/
      safeLocalStorage.ts
  hooks/
    useImageLoader.ts
    useDragPan.ts
    usePinchZoom.ts
  styles/
    globals.css
  types/
    image.ts
    editor.ts
    preferences.ts
  utils/
    clamp.ts
    file.ts
    math.ts
  main.tsx

public/
  icons/
  manifest.webmanifest
  offline-fallback.html
```

### Notas de estructura

- Mantener `lib/canvas` como núcleo técnico reutilizable
- Evitar mezclar lógica de composición con componentes visuales
- Mantener `features/editor` como orquestador del flujo principal
- No agregar router si el producto sigue siendo de una sola pantalla

---

## 6. Flujos de Usuario

### 6.1 Flujo principal

1. El usuario abre CuadraFoto
2. Ve CTA para subir una imagen
3. Selecciona una imagen compatible
4. La app genera una preview cuadrada automática
5. El usuario ajusta posición y escala
6. El usuario elige `Blur` o `Color`
7. Si elige `Blur`, ajusta intensidad
8. Si elige `Color`, elige un color sugerido o manual
9. El usuario selecciona formato de salida
10. Descarga el resultado final

### 6.2 Flujo de primera visita

1. El usuario entra por primera vez
2. La app carga el shell y registra el service worker
3. Si está en iPhone Safari, puede mostrarse ayuda breve para agregar a pantalla de inicio
4. No se requiere registro ni onboarding largo

### 6.3 Flujo offline

1. El usuario ya abrió antes la app con conexión
2. Más tarde vuelve sin internet
3. La app abre desde caché
4. El usuario puede editar y exportar imágenes localmente

### 6.4 Flujo de recuperación de error

1. El usuario selecciona un archivo inválido o corrupto
2. La app muestra un mensaje claro
3. Se mantiene disponible la acción para intentar con otro archivo

### 6.5 Flujo de persistencia

1. El usuario usa ciertos ajustes
2. La app guarda preferencias simples al cambiar controles relevantes
3. En la próxima sesión se restauran esos defaults si el storage está disponible

---

## 7. Riesgos Técnicos

### 7.1 Compatibilidad de blur en Safari

El comportamiento de blur en canvas puede variar entre navegadores y versiones. La composición debe diseñarse con una estrategia compatible y verificarse específicamente en iPhone Safari.

Mitigación:

- Probar blur real en Safari temprano
- Tener una implementación de fallback simple si el filtro no rinde o no se comporta igual

### 7.2 Uso de memoria con imágenes grandes

Imágenes de alta resolución pueden disparar consumo de memoria en móviles al mantener varios buffers o canvases.

Mitigación:

- Limitar el tamaño interno de preview
- Separar resolución de preview y resolución de exportación
- Liberar referencias intermedias cuando ya no se necesiten

### 7.3 Diferencias entre preview y export

Si preview y export usan caminos de render distintos, el resultado final puede no coincidir con lo visto por el usuario.

Mitigación:

- Usar una única función de composición reutilizable
- Probar consistencia visual con casos verticales, horizontales y panorámicos

### 7.4 Descarga en iPhone

La experiencia de descarga puede variar en Safari móvil según formato y comportamiento del navegador.

Mitigación:

- Probar flujo real en iPhone
- Mantener nombres de archivo simples
- Considerar alternativas compatibles si `download` no se comporta igual en algún escenario

### 7.5 Extracción de colores poco útil

Una paleta puramente estadística puede devolver colores dominantes que no sean agradables como fondo.

Mitigación:

- Normalizar y deduplicar colores cercanos
- Filtrar extremos poco útiles
- Validar visualmente con distintos tipos de imagen

### 7.6 Complejidad accidental del estado

Los controles de posición, escala, fondo y export pueden degradar rápido si el estado no está bien modelado.

Mitigación:

- Definir un modelo de estado único del editor
- Evitar duplicar estado derivado
- Centralizar transformaciones y defaults

### 7.7 EXIF y orientación

Fotos tomadas desde móvil pueden verse rotadas si no se normalizan correctamente.

Mitigación:

- Resolver orientación en el pipeline de carga
- Validar con imágenes reales tomadas en iPhone y Android

---

## 8. Criterios de Aceptación

### 8.1 Carga

- Dado un archivo `JPG`, `JPEG` o `PNG` válido, la app lo carga sin backend
- Dado un archivo no soportado, la app informa el error sin romper la UI

### 8.2 Preview

- Al cargar una imagen, la app muestra una preview cuadrada automáticamente
- La preview conserva la proporción de la imagen principal

### 8.3 Transformación

- El usuario puede mover la imagen principal dentro del cuadro
- El usuario puede escalar la imagen principal sin deformarla
- El usuario puede resetear los ajustes principales

### 8.4 Fondo blur

- El usuario puede activar fondo blur
- El blur usa la misma imagen como base
- El usuario puede ajustar la intensidad y ver el cambio en preview

### 8.5 Fondo color

- El usuario puede activar fondo color
- La app muestra una paleta sugerida de colores dominantes
- El usuario puede seleccionar un color sugerido
- El usuario puede elegir un color manual

### 8.6 Exportación

- El usuario puede exportar en PNG
- El usuario puede exportar en JPG
- El usuario puede ajustar calidad JPG
- El archivo descargado respeta el encuadre y fondo vistos en preview

### 8.7 Persistencia

- La app recuerda preferencias simples entre sesiones cuando `localStorage` está disponible
- Si `localStorage` falla o no está disponible, la app sigue funcionando sin bloquear el flujo

### 8.8 Offline

- Después de una primera carga exitosa, la app vuelve a abrir sin conexión
- La edición y exportación siguen funcionando offline

### 8.9 PWA

- La app incluye manifest válido
- La app registra service worker de forma correcta
- En iPhone Safari, el usuario puede agregar la app a pantalla de inicio
- La app se abre en modo standalone desde el icono instalado

### 8.10 Calidad general

- El flujo completo puede realizarse desde móvil con una sola mano en condiciones normales
- La UI es clara, táctil y sin pasos innecesarios
- El resultado exportado es adecuado para publicación en redes sociales

---

## Principios de Implementación

- Priorizar simplicidad sobre flexibilidad prematura
- Resolver primero Safari iPhone y luego optimizar escritorio
- Reutilizar la misma lógica para preview y exportación
- Mantener dependencias al mínimo
- No introducir backend, cuentas ni features adyacentes en el MVP

---

## Decisiones Iniciales Recomendadas

- Una sola pantalla principal
- Sin router en el primer corte
- Canvas 2D como motor de composición
- `1080x1080` como export por defecto
- `JPG` alta calidad como salida por defecto
- Persistencia mínima con `localStorage`

---

## Definición de Hecho del MVP

El MVP de CuadraFoto se considera listo cuando una persona puede abrir la app en iPhone Safari o navegador moderno, cargar una imagen, convertirla a cuadrado con fondo blur o color, ajustar encuadre, exportar en buena calidad y repetir el flujo sin depender de un backend ni de conexión activa.
