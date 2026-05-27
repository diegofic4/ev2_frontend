// 1. Obtener los elementos del DOM 
const formulario = document.getElementById('registroForm');
const mensajeExito = document.getElementById('mensajeExito');
const cuerpoTabla = document.getElementById('cuerpoTabla');
const buscarInput = document.getElementById('buscarInput');

// Arreglo para almacenar los objetos de los colaboradores
let listaColaboradores = [];

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

// 3. Evento principal del formulario
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

/**
 * FUNCIÓN: Elimina un colaborador del arreglo basándose en su ID
 * y actualiza la tabla.
 */
function eliminarColaborador(id) {
    // 1. Hacemos uso de filter para solo borrar el colaborador con la ID correspondiente
    listaColaboradores = listaColaboradores.filter(function(colaborador) {
        return colaborador.id !== id;
    });

    const textoBusqueda = document.getElementById('buscarInput').value;
    
    if (textoBusqueda !== '') {
        renderizarTabla(filtrarColaboradores(textoBusqueda));
    } else {
        renderizarTabla();
    }
}
buscarInput.addEventListener('input', function() {
    const texto = buscarInput.value;
    
    const resultadosFiltrados = filtrarColaboradores(texto);
    
    renderizarTabla(resultadosFiltrados);
});
