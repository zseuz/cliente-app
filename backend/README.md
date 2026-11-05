# Ventas API (Node + Express + PostgreSQL)

API REST en TypeScript con arquitectura **MVC por capas** para gestionar **vendedores**, **productos** y **ventas**.

## Arquitectura

```
Request → routes → middlewares (validate: Zod) → controllers → services → models → PostgreSQL
                                                     ↓ errores
                                              error-handler (HTTP status + JSON)
```

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| **Model** | `src/models` | Acceso a datos con SQL parametrizado (`pg`). Mapea `snake_case` → `camelCase`. Acepta un `Queryable` para participar en transacciones. |
| **Service** | `src/services` | Reglas de negocio (stock, precio histórico, vendedores/productos activos) y transacciones. |
| **Controller** | `src/controllers` | Traduce HTTP ↔ servicio. Sin SQL ni lógica de negocio. |
| **Routes** | `src/routes` | `crudRouter()` genera las 5 rutas REST con validación de params/query/body. |
| **Validators** | `src/validators` | Esquemas Zod (fuente única de verdad de los payloads). |
| **Middlewares** | `src/middlewares` | Validación y manejo centralizado de errores (Zod, `HttpError`, códigos de Postgres). |

### Reglas de negocio de ventas

- El **precio unitario se congela** al registrar la venta; `total` es una columna generada (`cantidad * precio_unitario`).
- Crear / editar / eliminar una venta **ajusta el stock en la misma transacción**.
- Los productos se bloquean con `SELECT … FOR UPDATE` en orden de `id` → **no hay sobreventa** con peticiones concurrentes y se evitan deadlocks (hay un test que lo comprueba).
- No se puede vender con vendedor o producto **inactivo**, ni más unidades que el stock (`409` con `{ disponible, solicitado }`).
- No se pueden borrar vendedores/productos con ventas (`ON DELETE RESTRICT` → `409`); se sugiere desactivarlos.

## Endpoints

Base: `http://localhost:3000/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado de la API y la BD |
| GET | `/vendedores?page=&limit=&search=` | Listado paginado |
| GET | `/vendedores/:id` | Detalle |
| POST | `/vendedores` | Crear |
| PUT | `/vendedores/:id` | Actualizar |
| DELETE | `/vendedores/:id` | Eliminar |
| … | `/productos` | Igual que vendedores |
| GET | `/ventas?page=&limit=&search=&vendedorId=&productoId=&desde=&hasta=` | Listado + `summary.totalVendido` |
| … | `/ventas/:id` | GET / PUT / DELETE |
| POST | `/ventas` | `{ vendedorId, productoId, cantidad, fecha?, observaciones? }` |

Respuesta paginada: `{ data: [...], meta: { page, limit, total, totalPages } }`
Errores: `{ message, errors?: [{ field, message }], details? }` — `400` validación, `404`, `409` conflicto, `422` regla de negocio.

## Puesta en marcha

### Opción A — Docker
```bash
docker compose up -d --build      # desde la raíz del repo: Postgres + API (aplica migraciones)
docker compose exec api node dist/scripts/migrate.js --seed   # datos de ejemplo (opcional)
```

### Opción B — Local
Requiere Node 18+ y PostgreSQL.
```bash
cd backend
cp .env.example .env              # ajustar credenciales
createdb ventas_db
npm install
npm run db:seed                   # migraciones + datos de ejemplo (db:migrate solo migra)
npm run dev                       # http://localhost:3000/api
```

## Tests
Tests de integración (Jest + Supertest) contra una BD real `ventas_test` que se recrea en cada ejecución:
```bash
npm test
```

## Scripts
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con recarga |
| `npm run build` / `npm start` | Compilar y ejecutar |
| `npm run db:migrate` | Aplica migraciones pendientes (`db/migrations`, registradas en `schema_migrations`) |
| `npm run db:seed` | Migraciones + seeds |
| `npm run typecheck` | Verificación de tipos |
| `npm test` | Tests de integración |
