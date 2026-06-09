# ⚽ Copa Mundial Contactvox 2026

Sistema interno de pronósticos del Mundial FIFA 2026 para Contactvox CX.

## 📁 Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | **Página pública** — colaboradores ingresan sus pronósticos |
| `admin.html` | **Panel admin** — Talento Humano carga resultados oficiales |
| `data.js` | Lógica compartida: datos de partidos, cálculo de puntos, localStorage |

## 🚀 Despliegue en GitHub Pages

1. Sube los 3 archivos a un repositorio de GitHub
2. Ve a **Settings → Pages → Source: Deploy from a branch → main / root**
3. Tu URL pública será: `https://TU_USUARIO.github.io/TU_REPO/`
4. La página de admin estará en: `https://TU_USUARIO.github.io/TU_REPO/admin.html`

> **Tip de seguridad:** Para que el admin no sea público, puedes renombrar `admin.html` a algo no obvio como `gestion-interna-cvx.html`.

## ⚙️ Cómo funciona

- Los datos se almacenan en **localStorage del navegador** — no requiere servidor ni base de datos.
- Cada colaborador se registra con su nombre y área en `index.html`.
- Talento Humano abre `admin.html`, ingresa los marcadores oficiales y guarda.
- El ranking se **recalcula automáticamente** para todos los participantes.
- Los pronósticos se guardan por `userId` en localStorage, lo que significa que cada dispositivo/navegador mantiene su sesión.

## 📊 Sistema de puntos

### Fase de Grupos
| Acierto | Puntos |
|---|---|
| Marcador exacto | 5 pts |
| Ganador / empate correcto | 3 pts |
| + Diferencia de goles | +1 pt |

### Fase Eliminatoria
| Acierto | Puntos |
|---|---|
| Marcador exacto | 8 pts |
| Equipo clasificado correcto | 5 pts |
| Ganador correcto | 3 pts |

## 📝 Notas

- Los 72 partidos de la fase de grupos están pre-cargados con fechas y sedes reales del Mundial 2026.
- El acordeón organiza los partidos por **12 grupos (A–L)**.
- El ranking incluye: posición, nombre, área, exactos, aciertos, partidos jugados y puntos totales.
- Función de **exportar CSV** disponible en el panel admin.
