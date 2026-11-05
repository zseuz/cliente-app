# ClientesApp

Aplicación Angular 14 + Bootstrap. Incluye:

- **Clientes** (módulo original, consume una API Spring en `localhost:8080`).
- **CRUD de Vendedores, Productos y Ventas** — frontend Angular + API **Node/Express** (`/backend`) + **PostgreSQL**.

## Arranque rápido del CRUD de ventas

```bash
# 1) Base de datos + API  (ver backend/README.md para la opción sin Docker)
docker compose up -d --build
docker compose exec api node dist/scripts/migrate.js --seed

# 2) Frontend
npm install
npm start          # http://localhost:4200/ventas
```

La URL de la API se configura en `src/environments/environment.ts` (`ventasApiUrl`).

## Estructura del frontend (CRUD de ventas)

```
src/app/
├── core/
│   ├── models/paginated.ts           # Tipos de paginación y errores de la API
│   └── services/
│       ├── crud.service.ts           # Servicio REST genérico (list/get/create/update/delete)
│       └── notification.service.ts   # SweetAlert2 + mapeo de errores de la API al formulario
├── shared/
│   ├── list-page.ts                  # Base de listados: búsqueda con debounce, paginación, eliminar
│   ├── form-page.ts                  # Base de formularios crear/editar
│   ├── pager/                        # Paginador
│   └── control-error/                # Mensajes de validación (cliente y servidor)
├── vendedores/   (módulo lazy: model, service, list, form)
├── productos/    (módulo lazy)
└── ventas/       (módulo lazy: filtros por vendedor/fechas, total en vivo, control de stock)
```

- Formularios reactivos tipados (`NonNullableFormBuilder`) con validaciones espejo de las del backend.
- Los errores por campo que devuelve la API (`400`) se pintan sobre el control correspondiente.
- `switchMap` cancela peticiones obsoletas al buscar; los módulos se cargan bajo demanda.

## Comandos Angular

- `ng serve` — servidor de desarrollo en `http://localhost:4200/`
- `ng build` — compila en `dist/`
- `ng test` — tests unitarios (Karma)
