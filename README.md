# Catálogo de productos con favoritos y acceso por roles

API REST con **Node.js + Express + PostgreSQL** para gestionar un catálogo de productos y los favoritos personales de cada usuario, con autenticación **JWT** y autorización por **roles** (`usuario` y `admin`).

## Integrantes

- _Nombre Apellido1 Apellido2_ — GitHub: `@usuario`
- _(segundo integrante, si aplica)_

## Propósito

Practicar el diseño de una API segura: separación en capas (rutas → controladores → acceso a datos), validación en el servidor, hashing de contraseñas, JWT con vencimiento, permisos por rol y aislamiento de datos entre usuarios.

## Elección de base de datos: PostgreSQL con `pg`

- El modelo es **relacional por naturaleza** (usuarios ↔ favoritos ↔ productos).
- La **clave primaria compuesta** `(usuario_id, producto_id)` impide favoritos duplicados a nivel de base de datos, y las **claves foráneas** impiden referencias inexistentes.
- `ON DELETE CASCADE` mantiene los datos consistentes al eliminar un producto.
- `CHECK (precio > 0)` y `UNIQUE (correo)` refuerzan las reglas de negocio aunque falle la validación de la aplicación.
- Consultas **parametrizadas** (`$1, $2…`) previenen inyección SQL.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior (local, o gratuito en la nube: Neon, Supabase o Render)
- Postman (para las pruebas)

## Instalación

```bash
git clone https://github.com/USUARIO/catalogo-api.git
cd catalogo-api
npm install
cp .env.example .env        # en Windows: copy .env.example .env
```

Crea la base de datos (una sola vez):

```bash
# con psql
psql -U postgres -c "CREATE DATABASE catalogo;"
```

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `DATABASE_URL` | Cadena de conexión, p. ej. `postgresql://postgres:clave@localhost:5432/catalogo` |
| `DB_SSL` | `true` si el proveedor exige SSL (Neon, Render, Supabase) |
| `JWT_SECRET` | Secreto de firma, **mínimo 32 caracteres aleatorios** |
| `JWT_EXPIRES_IN` | Vigencia del token (por defecto `1h`) |
| `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD` | Datos del administrador inicial |

Para generar un secreto aleatorio:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Inicialización de datos y del administrador

```bash
npm run db:init       # crea tablas y carga 6 productos ficticios (solo si la tabla está vacía)
npm run admin:crear   # crea el administrador con los datos de ADMIN_* del .env
```

El rol `admin` **solo** se obtiene con este script. `POST /auth/registro` siempre crea usuarios con rol `usuario`, aunque el cliente envíe `"rol": "admin"`.

## Ejecución

```bash
npm start        # producción
npm run dev      # desarrollo con recarga automática (nodemon)
```

La API queda en `http://localhost:3000/api`. Comprobación rápida: `GET /api/salud`.

## Estructura del proyecto

```
src/
  app.js              Configuración de Express y montaje de rutas
  server.js           Arranque y validación de variables de entorno
  config/db.js        Pool de conexiones PostgreSQL
  routes/             Definición de rutas y middlewares por ruta
  controllers/        Lógica HTTP: validar, decidir códigos de estado, responder
  data/               Acceso a datos (consultas SQL parametrizadas)
  middleware/         verificarToken, requerirRol, manejo de errores
  utils/              Validaciones y formato de respuestas
sql/                  schema.sql y seed.sql
scripts/              init-db, create-admin, token-expirado
postman/              Colección y entorno de ejemplo (sin secretos)
```

## Formato de respuestas

```json
{ "ok": true,  "data": { } }
{ "ok": false, "mensaje": "Descripción del error", "errores": ["detalle 1", "detalle 2"] }
```

## Criterio de códigos de estado

| Código | Uso |
|---|---|
| 200 | Consultas y actualizaciones correctas |
| 201 | Creación correcta |
| 204 | Eliminación correcta (sin cuerpo) |
| 400 | Datos inválidos: campos vacíos, correo mal formado, precio ≤ 0 o no numérico, identificadores no válidos, JSON mal formado |
| 401 | Sin token, token inválido o vencido, credenciales incorrectas |
| 403 | Autenticado pero sin el rol requerido |
| 404 | Recurso inexistente (producto, favorito, ruta) |
| 409 | Duplicado (correo ya registrado, favorito repetido) |

**Criterio 400 vs 422:** se usa 400 para toda validación de entrada fallida, por simplicidad y consistencia.

## Rutas

Todas con prefijo `/api`.

| Método y ruta | Acceso | Cuerpo | Respuestas |
|---|---|---|---|
| `POST /auth/registro` | Público | `{nombre, correo, password}` (mín. 8 caracteres) | 201, 400, 409 |
| `POST /auth/login` | Público | `{correo, password}` | 200 (con `token`), 400, 401 |
| `GET /productos?categoria=` | Público | — | 200 |
| `GET /productos/:id` | Público | — | 200, 400, 404 |
| `POST /productos` | Admin | `{nombre, descripcion, categoria, precio}` | 201, 400, 401, 403 |
| `PUT /productos/:id` | Admin | igual que POST (todos los campos) | 200, 400, 401, 403, 404 |
| `DELETE /productos/:id` | Admin | — | 204, 400, 401, 403, 404 |
| `GET /favoritos` | Autenticado | — | 200, 401 |
| `POST /favoritos` | Autenticado | `{productoId}` | 201, 400, 401, 404, 409 |
| `DELETE /favoritos/:productoId` | Autenticado | — | 204, 400, 401, 404 |

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`.

### Ejemplos

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/registro -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","correo":"ana@test.com","password":"Clave12345"}'

# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"ana@test.com","password":"Clave12345"}'

# Agregar favorito
curl -X POST http://localhost:3000/api/favoritos -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" -d '{"productoId":1}'
```

## Decisiones de seguridad

- Contraseñas con **bcrypt** (10 rondas); nunca se devuelven ni el texto ni el hash.
- JWT firmado con HS256; se verifica **firma y expiración** en cada petición protegida.
- La identidad en favoritos sale del **token verificado**; cualquier `usuarioId` enviado por el cliente se ignora.
- Los favoritos se consultan y eliminan siempre filtrando por `usuario_id` del token.
- Login con mensaje genérico (`Credenciales incorrectas.`) para no revelar si el correo existe.
- Lista blanca de campos aceptados; límite de 10 KB por petición.
- Errores 500 con mensaje genérico; el detalle solo se registra en el servidor.
- Al eliminar un producto, sus favoritos se **eliminan en cascada**.

## Pruebas con Postman

1. Importa `postman/Catalogo.postman_collection.json` y `postman/Catalogo.postman_environment.json`.
2. En el entorno, completa `adminPassword` (la misma de `ADMIN_PASSWORD`).
3. Para la prueba de token vencido: `npm run token:expirado` y pega el resultado en `expiredToken`.
4. Con el servidor en marcha, abre **Collection Runner** y ejecuta las carpetas **1 a 7** en orden.
5. Reinicia el servidor (`Ctrl+C`, `npm start`) y ejecuta la carpeta **8** para evidenciar persistencia.

Por línea de comandos (opcional): `npm run test:postman -- --env-var adminPassword=TU_CLAVE --env-var expiredToken=$(npm run -s token:expirado)`


## Despliegue



## Recursos y herramientas de apoyo

- Documentación de Express, node-postgres (`pg`), `jsonwebtoken` y `bcryptjs`.
- Asistente de IA (Claude, de Anthropic) para generar el código base, la colección de Postman y la documentación; el código fue revisado, ejecutado y comprendido por los autores.
