// Smoke test: valida que el script y la app funcionan con carga mínima.
// No mide rendimiento; si esto falla, no tiene sentido lanzar load/stress.
//
// Ejecución (desde la raíz del proyecto, con la app levantada):
//   docker run --rm --network perf-net -e BASE_URL=http://quickpizza:3333 -v "${PWD}/k6:/k6:ro" grafana/k6:2.3.0 run /k6/scripts/smoke.js

import http from 'k6/http';
import { check, sleep } from 'k6';

// La URL llega por variable de entorno (-e BASE_URL=...). Sin valor por defecto
// a propósito: preferimos fallar antes que apuntar a un entorno equivocado.
const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) {
  throw new Error('Falta BASE_URL. Ejemplo: -e BASE_URL=http://quickpizza:3333');
}

// Configuración de la carga (≈ Thread Group) y criterios de aceptación.
export const options = {
  vus: 1, // usuarios virtuales concurrentes (≈ número de hilos)
  duration: '30s', // cada VU repite la default function durante este tiempo

  // Si algún threshold no se cumple, k6 termina con código de salida != 0
  // (en Jenkins, eso marcará el build como fallido).
  thresholds: {
    http_req_failed: ['rate==0'], // smoke: 0% de peticiones fallidas
    checks: ['rate==1'], // todos los checks deben pasar
    http_req_duration: ['p(95)<500'], // 95% de las peticiones en menos de 500 ms
  },
};

// Una iteración: lo que cada VU ejecuta en bucle (≈ samplers del Thread Group).
// En los checks de contenido se valida primero el status: si la petición falló
// no hay JSON, r.json() lanzaría una excepción, se cortaría la iteración antes
// del sleep() y el VU lanzaría peticiones sin pausa.
export default function () {
  const quotes = http.get(`${BASE_URL}/api/quotes`);
  check(quotes, {
    'quotes: status 200': (r) => r.status === 200,
    'quotes: devuelve al menos una cita': (r) => r.status === 200 && r.json('quotes').length > 0,
  });

  const names = http.get(`${BASE_URL}/api/names`);
  check(names, {
    'names: status 200': (r) => r.status === 200,
    'names: devuelve al menos un nombre': (r) => r.status === 200 && r.json('names').length > 0,
  });

  // Think time entre iteraciones (≈ Constant Timer).
  sleep(1);
}
