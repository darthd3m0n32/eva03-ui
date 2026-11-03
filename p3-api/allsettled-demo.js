const CIUDADES = ['Lima', 'Cusco', 'Xyzabc'];

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function buscarCiudad(nombre) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(nombre)}&count=1&language=es`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocodificacion HTTP ${response.status}`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No se encontraron resultados para "${nombre}".`);
  }
  const lugar = data.results[0];
  return { nombre: lugar.name, latitud: lugar.latitude, longitud: lugar.longitude };
}

async function obtenerClima(lat, lon) {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Clima HTTP ${response.status}`);
  const data = await response.json();
  return { temperatura: data.current.temperature_2m, viento: data.current.wind_speed_10m };
}

async function climaCompleto(nombre) {
  const ciudad = await buscarCiudad(nombre);
  const clima = await obtenerClima(ciudad.latitud, ciudad.longitud);
  return { nombre: ciudad.nombre, ...clima };
}

async function probarPromiseAll() {
  console.log('\n--- Promise.all con ["Lima", "Cusco", "Xyzabc"] ---');
  try {
    const resultados = await Promise.all(CIUDADES.map((c) => climaCompleto(c)));
    console.log('Resultado (fulfilled):', resultados);
  } catch (error) {
    console.log('Promise.all RECHAZADO tan pronto falla una promesa:', error.message);
    console.log('Se pierden los resultados de las demas ciudades desde el consumidor.');
  }
}

async function probarPromiseAllSettled() {
  console.log('\n--- Promise.allSettled con ["Lima", "Cusco", "Xyzabc"] ---');
  const resultados = await Promise.allSettled(
    CIUDADES.map((c) => climaCompleto(c))
  );
  for (const resultado of resultados) {
    if (resultado.status === 'fulfilled') {
      console.log(`  [fulfilled] ${resultado.value.nombre}: ${resultado.value.temperatura}°C, ${resultado.value.viento} km/h`);
    } else {
      console.log(`  [rejected] ${resultado.reason.message}`);
    }
  }
  console.log('Promise.allSettled devuelve el estado de CADA promesa (fulfilled/rejected).');
}

async function main() {
  await probarPromiseAll();
  await probarPromiseAllSettled();
}

main().catch((err) => {
  console.error('Demo falló:', err);
  process.exit(1);
});
