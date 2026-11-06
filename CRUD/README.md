# CRUD Ventas

Proyecto para manejar vendedores, productos y ventas. El front está hecho en Angular, el back en Node con Express y la base de datos en PostgreSQL.

La idea es sencilla: se registran vendedores y productos, y luego se hacen ventas donde se escoge quién vendió y qué producto. Cuando se hace una venta se descuenta el stock del producto, y si se borra la venta el stock se devuelve.

## Tecnologías

- Angular 18 + Bootstrap 5
- Node.js + Express
- PostgreSQL
- pg (para conectar Node con Postgres)

## Estructura

```
CRUD/
├── back/        API en Node (routes, controllers, models)
├── front/       Aplicación en Angular
├── sql/         Scripts de la base de datos
└── diagrama/    Diagrama de las tablas y del flujo
```

En el back usé el patrón MVC:

- **routes**: las rutas de la API
- **controllers**: reciben la petición, validan y responden
- **models**: hacen las consultas a la base de datos

## Base de datos

Son tres tablas:

- **vendedor**: id_vendedor (PK), nombre, apellido, correo, telefono
- **producto**: id_producto (PK), nombre, descripcion, precio, stock
- **venta**: id_venta (PK), id_vendedor (FK), id_producto (FK), cantidad, total, fecha

Un vendedor puede tener muchas ventas y un producto puede estar en muchas ventas. El diagrama está en la carpeta `diagrama`.

Cada tabla tiene 5 registros de prueba.

## Cómo correrlo

Necesitas tener instalado Node.js (versión 18 o mayor) y PostgreSQL.

### 1. Crear la base de datos

En pgAdmin o en la consola, ejecutar los scripts de la carpeta `sql` en este orden:

1. `01_crear_base.sql` → crea la base `crud_ventas`
2. `02_crear_tablas.sql` → crea las tablas (conectado a `crud_ventas`)
3. `03_insertar_datos.sql` → inserta los datos

También está `script_completo.sql` que tiene las tablas y los datos juntos, por si se quiere correr todo de una vez.

### 2. Levantar el back

```
cd back
npm install
```

Copiar el archivo `.env.example` y renombrarlo a `.env`. Ahí se pone el usuario y la contraseña de Postgres:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_clave
DB_NAME=crud_ventas
```

Luego:

```
npm run dev
```

Debe salir `Servidor corriendo en http://localhost:3000`.

### 3. Levantar el front

En otra terminal:

```
cd front
npm install
npm start
```

Y abrir http://localhost:4200

## Endpoints

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | /api/vendedores | Lista los vendedores |
| GET | /api/vendedores/:id | Trae un vendedor |
| POST | /api/vendedores | Crea un vendedor |
| PUT | /api/vendedores/:id | Edita un vendedor |
| DELETE | /api/vendedores/:id | Elimina un vendedor |

Para productos y ventas es igual, solo cambia la ruta: `/api/productos` y `/api/ventas`.

Ejemplo para crear una venta:

```json
{
  "id_vendedor": 1,
  "id_producto": 2,
  "cantidad": 3,
  "fecha": "2026-11-06"
}
```

El total no se manda, lo calcula el back con el precio del producto.

## Notas

- No se puede eliminar un vendedor o un producto que ya tenga ventas, por las llaves foráneas.
- Si se intenta vender más de lo que hay en stock, sale un mensaje de error.
- Si cambias el puerto del back, hay que cambiar la URL en `front/src/app/services/api.ts`.
