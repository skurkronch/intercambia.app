# truXanger

Trueque entre vecinos: cambia lo que tienes por lo que quieres. Web mobile first con Next.js, desplegada en Vercel. Dominio final: truxange.com.

- **Sistema de diseño:** [artifact truXanger](https://claude.ai/artifact/CJEXfQXpdU1G1nhZ3A46EG). `src/styles/tokens.css` refleja su `tokens.json`; si cambias uno, cambia el otro.
- **PRD original:** `docs/PRD-intercambi-v1.md`. El demo de una sola página quedó en `legacy/`.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Antes de subir cambios: `npm run typecheck`, `npm run lint` y `npm run build`.

## Estructura

| Ruta | Qué es | Indexable |
| --- | --- | --- |
| `/` | Portada | Sí |
| `/buscar` | Búsqueda con filtros por categoría | Solo sin filtros |
| `/objeto/[slug]` | Página de cada objeto | Sí |
| `/categoria/[slug]`, `/ciudad/[slug]` | Listados para SEO | Sí |
| `/descubre` | Stack de swipe | No |
| `/publicar` | Asistente de 3 pasos | No |
| `/mensajes`, `/mensajes/[id]` | Chats y cierre de trueque | No |
| `/perfil` | Perfil, insignias, publicaciones | No |

- `src/lib/repo.ts`: acceso a datos. Hoy lee `src/lib/data/seed.ts`; en la fase 2 lee Supabase con las mismas firmas.
- `src/lib/store.ts`: estado de la persona (swipes, chats, estadísticas). Hoy en `localStorage`; en la fase 2, mutaciones de Supabase.
- `src/lib/match.ts`: emparejamiento (condición A del PRD) y filtros de Descubre.
- `src/lib/badges.ts`: catálogo de 19 insignias y sus reglas.

## Publicidad

- En el stack de swipe solo hay patrocinios vendidos directo (`SPONSORS`), uno cada 5 objetos como máximo.
- AdSense solo va en espacios fijos de páginas públicas y búsqueda. Se activa con las variables de `.env.example`. Sin ellas aparece un anuncio propio que invita a anunciarse.
- En el chat no hay publicidad.

## Indexación

El sitio responde `noindex` y `robots.txt` bloquea todo hasta que `NEXT_PUBLIC_SITE_URL` está configurada en el despliegue de producción. Así ni la URL `*.vercel.app` ni los datos de ejemplo llegan a Google.

## Fases

1. **Base (esta):** Next.js, sistema de diseño, diseño responsivo, páginas indexables y espacios publicitarios, con datos de ejemplo.
2. **Cuentas:** Supabase Auth, publicar con fotos en Supabase Storage, perfiles reales.
3. **Interacción:** swipes y match en servidor, chat en tiempo real, confirmación real de ambas partes.
4. **Comunidad:** reseñas, insignias en servidor, reportes y moderación, analítica.
