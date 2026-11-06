# CRUD Ventas

CRUD de vendedores, productos y ventas.

- **front**: Angular
- **back**: Node.js + Express (MVC: routes, controllers, models)
- **sql**: scripts de PostgreSQL (crear base, tablas y datos)
- **diagrama**: diagrama de las tablas y del flujo

## Requisitos

- Node.js 18 o superior
- PostgreSQL
- Angular CLI (opcional): `npm install -g @angular/cli`

## 1. Base de datos

Desde pgAdmin o desde la consola, en este orden:

1. `sql/01_crear_base.sql` (conectado a la base `postgres`)
2. `sql/02_crear_tablas.sql` (conectado a `crud_ventas`)
3. `sql/03_insertar_datos.sql` (conectado a `crud_ventas`)

Con psql seria:

```
psql -U postgres -f sql/01_crear_base.sql
psql -U postgres -d crud_ventas -f sql/02_crear_tablas.sql
psql -U postgres -d crud_ventas -f sql/03_insertar_datos.sql
```

## 2. Back

```
cd back
npm install
copy .env.example .env
npm run dev
```

En el `.env` hay que poner el usuario y la clave de PostgreSQL.
La API queda en http://localhost:3000/api

| Metodo | Ruta |
|---|---|
| GET | /api/vendedores |
| GET | /api/vendedores/:id |
| POST | /api/vendedores |
| PUT | /api/vendedores/:id |
| DELETE | /api/vendedores/:id |

Lo mismo para `/api/productos` y `/api/ventas`.

Cuando se registra una venta se descuenta el stock del producto y si se elimina se devuelve.
No se puede borrar un vendedor o producto que tenga ventas por la llave foranea.

## 3. Front

```
cd front
npm install
npm start
```

Abrir http://localhost:4200
