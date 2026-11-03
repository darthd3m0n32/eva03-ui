const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const form = document.getElementById('form-busqueda');
const inputCiudad = document.getElementById('ciudad');
const btnBuscar = document.getElementById('btn-buscar');
const divCargando = document.getElementById('estado-cargando');
const divResultado = document.getElementById('resultado');
const divMensaje = document.getElementById('mensaje');

const spCiudad = document.getElementById('resultado-ciudad');
const spRegion = document.getElementById('resultado-region');
const spTemperatura = document.getElementById('resultado-temperatura');
const spViento = document.getElementById('resultado-viento');

async function buscarCiudad(nombre) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(nombre)}&count=1&language=es`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error de geocodificacion (HTTP ${response.status}) al buscar "${nombre}".`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`CIUDAD_NO_ENCONTRADA: No se encontraron resultados para "${nombre}".`);
  }

  const lugar = data.results[0];
  return {
    nombre: lugar.name ?? nombre,
    admin1: lugar.admin1 ?? null,
    latitud: lugar.latitude,
    longitud: lugar.longitude,
    pais: lugar.country ?? null,
  };
}

async function obtenerClima(lat, lon) {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error de clima (HTTP ${response.status}) para lat=${lat}, lon=${lon}.`);
  }

  const data = await response.json();

  const current = data.current;
  if (!current) {
    throw new Error('La respuesta del clima no contiene el bloque "current".');
  }

  return {
    temperatura: current.temperature_2m,
    viento: current.wind_speed_10m,
    unidades: {
      temperatura: '°C',
      viento: 'km/h',
    },
  };
}

function mostrarCargando() {
  divCargando.classList.remove('oculto');
  divResultado.classList.add('oculto');
  divMensaje.classList.add('oculto');
  btnBuscar.disabled = true;
  btnBuscar.textContent = 'Buscando…';
}

function ocultarCargando() {
  divCargando.classList.add('oculto');
  btnBuscar.disabled = false;
  btnBuscar.textContent = 'Buscar clima';
}

function mostrarMensaje(texto) {
  divMensaje.textContent = texto;
  divMensaje.classList.remove('oculto');
  divResultado.classList.add('oculto');
}

function mostrarResultado({ nombre, admin1, temperatura, viento, unidades }) {
  spCiudad.textContent = nombre;
  if (admin1) {
    spRegion.textContent = `Region: ${admin1}`;
    spRegion.classList.remove('oculto');
  } else {
    spRegion.textContent = '';
    spRegion.classList.add('oculto');
  }
  spTemperatura.textContent = `Temperatura: ${temperatura} ${unidades.temperatura}`;
  spViento.textContent = `Viento: ${viento} ${unidades.viento}`;

  divMensaje.classList.add('oculto');
  divResultado.classList.remove('oculto');
}

async function buscarClimaCiudad(nombre) {
  mostrarCargando();
  try {
    const ciudad = await buscarCiudad(nombre);
    const clima = await obtenerClima(ciudad.latitud, ciudad.longitud);
    mostrarResultado({
      nombre: ciudad.nombre,
      admin1: ciudad.admin1,
      temperatura: clima.temperatura,
      viento: clima.viento,
      unidades: clima.unidades,
    });
  } catch (error) {
    console.error('Error buscando clima:', error);

    const mensaje = error.message.startsWith('CIUDAD_NO_ENCONTRADA')
      ? `No encontramos la ciudad "${nombre}". Revisa el nombre e inténtalo de nuevo.`
      : error.message.includes('fetch') || error.message.includes('Failed to fetch') || error instanceof TypeError
        ? 'Sin conexion. Revisa tu internet e inténtalo otra vez.'
        : error.message || 'Ocurrio un error al obtener el clima. Inténtalo de nuevo.';

    mostrarMensaje(mensaje);
  } finally {
    ocultarCargando();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const nombre = inputCiudad.value.trim();

  if (!nombre) {
    mostrarMensaje('Por favor, escribe el nombre de una ciudad.');
    return;
  }

  buscarClimaCiudad(nombre);
});
