const CIUDADES = ['Lima', 'Cusco', 'Arequipa'];

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function buscarCiudad(nombre) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(nombre)}&count=1&language=es`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocodificacion HTTP ${response.status}`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Ciudad no encontrada: ${nombre}`);
  }
  const lugar = data.results[0];
  return { nombre: lugar.name, latitud: lugar.latitude, longitud: lugar.longitude };
}

async function obtenerClima(lat, lon) {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Clima HTTP ${response.status}`);
  const data = await response.json();
  return {
    temperatura: data.current.temperature_2m,
    viento: data.current.wind_speed_10m,
  };
}

async function climaCompleto(nombre) {
  const ciudad = await buscarCiudad(nombre);
  const clima = await obtenerClima(ciudad.latitud, ciudad.longitud);
  return { nombre: ciudad.nombre, ...clima };
}

async function modoSecuencial() {
  const resultados = [];
  for (const ciudad of CIUDADES) {
    resultados.push(await climaCompleto(ciudad));
  }
  return resultados;
}

async function modoParalelo() {
  return await Promise.all(CIUDADES.map((c) => climaCompleto(c)));
}

function pausar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const REPETICIONES = 3;
  const resultadosSecuencial = [];
  const resultadosParalelo = [];

  console.log('Iniciando benchmark (3 mediciones por modo, alternadas)...\n');

  for (let i = 0; i < REPETICIONES; i++) {
    const t0Sec = performance.now();
    await modoSecuencial();
    const t1Sec = performance.now();
    resultadosSecuencial.push(t1Sec - t0Sec);
    console.log(`Corrida ${i + 1} - Secuencial: ${(t1Sec - t0Sec).toFixed(1)} ms`);

    await pausar(1500);

    const t0Par = performance.now();
    await modoParalelo();
    const t1Par = performance.now();
    resultadosParalelo.push(t1Par - t0Par);
    console.log(`Corrida ${i + 1} - Promise.all: ${(t1Par - t0Par).toFixed(1)} ms`);

    if (i < REPETICIONES - 1) {
      await pausar(1500);
    }
  }

  const promedioSec =
    resultadosSecuencial.reduce((a, b) => a + b, 0) / resultadosSecuencial.length;
  const promedioPar =
    resultadosParalelo.reduce((a, b) => a + b, 0) / resultadosParalelo.length;

  console.log('\n=== RESULTADOS ===');
  console.log('Secuencial (ms):', resultadosSecuencial.map((v) => v.toFixed(1)));
  console.log('Promise.all  (ms):', resultadosParalelo.map((v) => v.toFixed(1)));
  console.log(`Promedio Secuencial: ${promedioSec.toFixed(1)} ms`);
  console.log(`Promedio Promise.all: ${promedioPar.toFixed(1)} ms`);
  console.log(`Diferencia: ${(promedioSec - promedioPar).toFixed(1)} ms más lento el secuencial`);
}

main().catch((err) => {
  console.error('Benchmark falló:', err);
  process.exit(1);
});
