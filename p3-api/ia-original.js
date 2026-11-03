const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const form = document.getElementById('form-busqueda');
const input = document.getElementById('ciudad');
const btn = document.getElementById('btn-buscar');
const resultado = document.getElementById('resultado');
const mensaje = document.getElementById('mensaje');

async function buscarCiudad(nombre) {
  const url = `${GEOCODING_URL}?name=${nombre}&count=10&language=es`;
  const response = await fetch(url);
  const data = await response.json();
  const lugar = data.results[0];
  return {
    nombre: lugar.name,
    admin1: lugar.admin1,
    latitud: lugar.latitude,
    longitud: lugar.longitude,
  };
}

async function obtenerClima(lat, lon) {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed=kmh`;
  const response = await fetch(url);
  const data = await response.json();
  return {
    temperatura: data.current_weather.temperature,
    viento: data.current_weather.windspeed,
  };
}

async function buscarClimaCiudad(nombre) {
  const ciudad = await buscarCiudad(nombre);
  const clima = await obtenerClima(ciudad.latitud, ciudad.longitud);
  resultado.innerHTML = `
    <h2>${ciudad.nombre}</h2>
    <p>${ciudad.admin1}</p>
    <p>Temperatura: ${clima.temperatura}°C</p>
    <p>Viento: ${clima.viento} km/h</p>
  `;
  resultado.classList.remove('oculto');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const nombre = input.value.trim();
  if (!nombre) {
    mensaje.textContent = 'Escribe una ciudad.';
    return;
  }
  buscarClimaCiudad(nombre);
});
