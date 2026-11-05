import { api, closeDb } from './helpers';

afterAll(closeDb);

it('health check y 404 de rutas desconocidas', async () => {
  await api.get('/api/health').expect(200);
  await api.get('/api/nada').expect(404);
  await api.post('/api/vendedores').set('Content-Type', 'application/json').send('{malo').expect(400);
});
