# truXanger

Trueque entre vecinos: cambia lo que tienes por lo que quieres. Web mobile first con Next.js y Supabase, desplegada en Vercel. Dominio final: truxange.com.

- **Sistema de diseño:** [artifact truXanger](https://claude.ai/artifact/CJEXfQXpdU1G1nhZ3A46EG). `src/styles/tokens.css` refleja su `tokens.json`; si cambias uno, cambia el otro.
- **PRD original:** `docs/PRD-intercambi-v1.md`. El demo de una sola página quedó en `legacy/`.

## Correr en local

```bash
npm install
cp .env.example .env.local   # y llena las variables de Supabase
npm run dev
```

Abre http://localhost:3000. Antes de subir cambios: `npm run typecheck`, `npm run lint`, `npm run test:db` y `npm run build`.

Sin variables de Supabase la app compila y corre, pero vacía y sin cuentas.

## Conectar Supabase (una vez por proyecto)

1. **Base de datos.** En el SQL Editor de Supabase corre `supabase/migrations/20261023000000_init.sql` completo. Crea tablas, reglas de seguridad, el bucket de fotos y las funciones de match y trueque.
2. **Contenido de ejemplo (solo staging).** Si quieres objetos para probar, corre `supabase/seed-demo.sql`. Son 20 objetos de cuentas que no pueden entrar; sus fotos están en `public/demo/` (ver `public/demo/LEEME.md`). **Nunca en producción.**
3. **Auth → URL Configuration.** *Site URL*: la URL de producción. *Redirect URLs*: `http://localhost:3000/auth/callback`, `https://<tu-proyecto>.vercel.app/auth/callback` y `https://truxange.com/auth/callback`.
4. **Auth → Emails.** Pega `supabase/email-templates/entrar.html` en las plantillas *Magic link* y *Confirm signup*. El enlace usa `/auth/confirm` con token hash (funciona aunque el correo se abra en otro navegador) e incluye un código de 6 dígitos.
5. **Auth → Providers → Google** (opcional). Requiere un cliente OAuth de Google Cloud. Sin esto, se entra con enlace mágico al correo.
6. **Correo.** El correo integrado de Supabase permite pocos envíos por hora. Antes de lanzar, configura SMTP propio (Auth → SMTP Settings), por ejemplo con Resend.
7. **Vercel.** En Settings → Environment Variables agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y vuelve a desplegar.

## Estructura

| Ruta | Qué es | Acceso |
| --- | --- | --- |
| `/` | Portada | Público, indexable |
| `/buscar` | Búsqueda con filtros por categoría | Público |
| `/objeto/[slug]`, `/categoria/[slug]`, `/ciudad/[slug]` | Páginas para SEO, regeneradas cada minuto | Público, indexable |
| `/entrar`, `/auth/confirm`, `/auth/callback` | Enlace o código por correo, y Google | Público |
| `/bienvenida` | Completar perfil la primera vez | Con cuenta |
| `/descubre` | Stack de swipe | Con cuenta |
| `/publicar` | Asistente de 3 pasos con fotos | Con cuenta |
| `/mensajes`, `/mensajes/[id]` | Chats en tiempo real, cierre de trueque y calificación | Con cuenta |
| `/perfil` | Perfil, insignias, publicaciones, reseñas | Con cuenta |

- `supabase/migrations/`: esquema y seguridad. `npm run test:db` lo prueba en PGlite (Postgres en Node) con 36 casos de RLS y trueques.
- `src/lib/repo.ts`: lecturas en el servidor. Las públicas usan un cliente sin cookies para que las páginas se generen estáticas.
- `src/app/actions.ts`: escrituras (swipes, match, publicar, chat, confirmar, calificar, perfil).
- `src/proxy.ts`: refresca la sesión y manda a `/entrar` las rutas privadas.
- `src/lib/match.ts`: emparejamiento (condición A del PRD), que corre en el servidor al deslizar a la derecha.
- `src/lib/badges.ts`: 19 insignias. Sus números salen de `profile_stats()` en la base.

## Seguridad

- Cada tabla tiene RLS. Los matches y la confirmación de trueques solo se escriben con funciones `security definer` que validan a los participantes.
- Las ubicaciones se guardan redondeadas a ~1 km. Las fotos se reescalan en el navegador, lo que también quita los datos EXIF.
- Cada persona solo puede subir fotos dentro de su carpeta (`<id>/…`) del bucket `listing-photos`.

## Publicidad

- En el stack de swipe solo hay patrocinios vendidos directo (`src/lib/sponsors.ts`), uno cada 5 objetos como máximo.
- AdSense solo va en espacios fijos de páginas públicas y búsqueda; se activa con las variables de `.env.example`.
- En el chat no hay publicidad.

## Indexación

`noindex` y `robots.txt` bloquean todo hasta que `NEXT_PUBLIC_SITE_URL` está configurada en el despliegue de producción.

## Fases

1. **Base:** Next.js, sistema de diseño, diseño responsivo, páginas indexables y espacios publicitarios. ✓
2. **Cuentas y datos reales (esta):** Supabase Auth, perfiles, publicar con fotos, swipes y match en servidor, chat en tiempo real, confirmación de ambas partes, reseñas e insignias calculadas en la base.
3. **Siguiente:** avisos (correo y push) de interés y match, editar o pausar publicaciones, reportes y moderación, verificación de identidad, analítica.
