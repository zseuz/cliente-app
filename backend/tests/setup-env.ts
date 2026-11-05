process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME_TEST ?? 'ventas_test';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_USER = process.env.DB_USER ?? 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'postgres';
