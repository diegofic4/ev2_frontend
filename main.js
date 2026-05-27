// 1. Obtener los elementos del DOM 
const formulario = document.getElementById('registroForm');
const mensajeExito = document.getElementById('mensajeExito');
const cuerpoTabla = document.getElementById('cuerpoTabla');
const buscarInput = document.getElementById('buscarInput');

// --- Persistencia con Local Storage ---
// Al cargar la página, intentamos obtener los datos guardados.
// Si no hay nada (null), usamos un arreglo vacío [] por defecto.
// Usamos JSON.parse porque Local Storage solo guarda texto plano.
let listaColaboradores = JSON.parse(localStorage.getItem('colaboradores')) || [];

// 2. Funciones Reutilizables de Validación 
function estaVacio(valor) {
    return valor.trim() === '';
}

function esCorreoCorporativoValido(correo) {
    const regex = /^[a-zA-Z0-9._-]+@empresa\.cl$/;
    return regex.test(correo);
}

function mostrarError(idElemento, mensaje) {
    const elemento = document.getElementById(idElemento);
    elemento.textContent = mensaje;
    elemento.style.display = 'block';
}

function limpiarMensajes() {
    const errores = document.querySelectorAll('.error');
    errores.forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });
    mensajeExito.textContent = '';
}

/**
 * FUNCIÓN: Se encarga exclusivamente de renderizar la tabla
 * a partir de los datos en el arreglo listaColaboradores.
 */
function renderizarTabla(arregloAMostrar = listaColaboradores) {
    cuerpoTabla.innerHTML = '';

    // --- Estado "Sin Resultados" ---
    // Si el arreglo que recibimos está vacío, mostramos un mensaje amigable.
    if (arregloAMostrar.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #777; padding: 20px;">
                    No se encontraron colaboradores.
                </td>
            </tr>
        `;
        return; // Salimos de la función para no ejecutar el forEach de abajo
    }

    // Ahora iteramos sobre el arreglo que recibimos por parámetro
    arregloAMostrar.forEach(function(colaborador) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${colaborador.nombre}</td>
            <td>${colaborador.apellido}</td>
            <td>${colaborador.cargo}</td>
            <td>${colaborador.correo}</td>
            <td>
                <button class="btn-eliminar" onclick="eliminarColaborador(${colaborador.id})">Eliminar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

// 3. Eventos e Interacciones
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault(); 
    limpiarMensajes();

    let formularioValido = true;

    // Obtener valores
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cargo = document.getElementById('cargo').value;
    const correo = document.getElementById('correo').value;

    // Validaciones
    if (estaVacio(nombre)) {
        mostrarError('errorNombre', 'El nombre es obligatorio.');
        formularioValido = false;
    }
    if (estaVacio(apellido)) {
        mostrarError('errorApellido', 'El apellido es obligatorio.');
        formularioValido = false;
    }
    if (estaVacio(cargo)) {
        mostrarError('errorCargo', 'El cargo es obligatorio.');
        formularioValido = false;
    }
    if (estaVacio(correo)) {
        mostrarError('errorCorreo', 'El correo es obligatorio.');
        formularioValido = false;
    } else if (!esCorreoCorporativoValido(correo)) {
        mostrarError('errorCorreo', 'El correo debe tener formato válido y terminar en @empresa.cl');
        formularioValido = false;
    }
    
    // --- LÓGICA SI LA VALIDACIÓN ES CORRECTA ---
    if (formularioValido) {
        // 1. Crear el objeto colaborador
        const nuevoColaborador = {
            id: Date.now(),
            nombre: nombre,
            apellido: apellido,
            cargo: cargo,
            correo: correo
        };

        // 2. Agregar el objeto al arreglo
        listaColaboradores.push(nuevoColaborador);

        // --- Guardar en Local Storage ---
        // Convertimos el arreglo a texto (JSON) y lo guardamos en el navegador
        localStorage.setItem('colaboradores', JSON.stringify(listaColaboradores));

        // 3. Llamar a la función para actualizar la vista de la tabla
        renderizarTabla();

        // 4. Mostrar mensaje y limpiar el formulario para un nuevo registro
        mensajeExito.textContent = '¡Colaborador registrado y agregado a la tabla!';
        formulario.reset(); 
    }
});

// Escaneo de todos los valores del objeto automatico, sin importa el numero de campos.
function filtrarColaboradores(terminoBusqueda) {
    const termino = terminoBusqueda.toLowerCase();

    return listaColaboradores.filter(function(colaborador) {
        return Object.values(colaborador).some(function(valor) {
            return String(valor).toLowerCase().includes(termino);
        });
    });
}
// --- Ordenamiento de tabla ---
// Variable para saber si ordenamos de A-Z o de Z-A
let ordenAscendente = true; 

function ordenarPor(propiedad) {
    // Usamos el método sort para comparar los elementos
    listaColaboradores.sort(function(a, b) {
        // Convertimos a minúsculas para comparar correctamente
        const valorA = String(a[propiedad]).toLowerCase();
        const valorB = String(b[propiedad]).toLowerCase();

        if (valorA < valorB) {
            return ordenAscendente ? -1 : 1;
        }
        if (valorA > valorB) {
            return ordenAscendente ? 1 : -1;
        }
        return 0; 
    });

    // Invertimos la variable para que el próximo clic ordene al revés (Z-A)
    ordenAscendente = !ordenAscendente;

    const textoBusqueda = buscarInput.value;

  if (textoBusqueda !== '') {
        // Si hay texto, filtramos el arreglo (que ya está ordenado) y renderizamos eso
        renderizarTabla(filtrarColaboradores(textoBusqueda));
    } else {
        // Si el buscador está vacío, renderizamos la lista completa
        renderizarTabla();
    }
}

/**
 * FUNCIÓN: Elimina un colaborador del arreglo basándose en su ID
 * y actualiza la tabla.
 */
function eliminarColaborador(id) {
    // 1. Hacemos uso de filter para solo borrar el colaborador con la ID correspondiente
    listaColaboradores = listaColaboradores.filter(function(colaborador) {
        return colaborador.id !== id;
    });

    // --- Actualizar Local Storage tras eliminar ---
    // Sobreescribimos los datos guardados con el nuevo arreglo que ya no tiene al colaborador eliminado
    localStorage.setItem('colaboradores', JSON.stringify(listaColaboradores));

    const textoBusqueda = document.getElementById('buscarInput').value;
    
    if (textoBusqueda !== '') {
        renderizarTabla(filtrarColaboradores(textoBusqueda));
    } else {
        renderizarTabla();
    }
}

let temporizadorBusqueda;
buscarInput.addEventListener('input', function() {
    clearTimeout(temporizadorBusqueda);

    temporizadorBusqueda = setTimeout(function(){
    const texto = buscarInput.value;
    const resultadosFiltrados = filtrarColaboradores(texto);
    renderizarTabla(resultadosFiltrados);}, 300);
});

// --- Renderizado Inicial ---
// Cuando la página cargue, ejecutamos esta función para que pinte en la tabla
// los datos que rescatamos del Local Storage.
renderizarTabla();