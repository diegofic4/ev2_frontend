// 1. Obtener los elementos del DOM 
const formulario = document.getElementById('registroForm');
const mensajeExito = document.getElementById('mensajeExito');
const cuerpoTabla = document.getElementById('cuerpoTabla');
const buscarInput = document.getElementById('buscarInput');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnCancelar = document.getElementById('btnCancelar');

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
                <button class="btn-editar" onclick="cargarColaborador(${colaborador.id})">Editar</button>
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
        
        if (idEdicion === null) {
            const nuevoColaborador = {
                id: Date.now(),
                nombre: nombre,
                apellido: apellido,
                cargo: cargo,
                correo: correo
            };
            listaColaboradores.push(nuevoColaborador);
            mensajeExito.textContent = '¡Colaborador registrado exitosamente!';
            
        } else {
            // MODO EDICIÓN 
            listaColaboradores = listaColaboradores.map(function(colaborador) {
                if (colaborador.id === idEdicion) {
                    // Si encontramos el que estábamos editando, le actualizamos los valores
                    return {
                        id: colaborador.id, // Mantenemos el mismo ID
                        nombre: nombre,
                        apellido: apellido,
                        cargo: cargo,
                        correo: correo
                    };
                }
                return colaborador; // Si no es el que buscamos, lo devolvemos tal cual
            });
            
            mensajeExito.textContent = '¡Colaborador actualizado correctamente!';
            
            // --- LIMPIEZA DEL MODO EDICIÓN ---
            idEdicion = null; // Apagamos el modo edición
            btnRegistrar.textContent = 'Registrar Colaborador'; 
            btnCancelar.style.display = 'none';
        }

        // Actualizamos Local Storage y la Tabla en cualquiera de los dos casos
        localStorage.setItem('colaboradores', JSON.stringify(listaColaboradores));
        renderizarTabla();
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
        // Convertimos a minúsculas para comparar correctamente y tambien a String por si en un futuro añadimos un campo que sea de numeros así no haya problemas con el tipo de dato.
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

let idEdicion = null;

/**
 * FUNCIÓN: Toma los datos del colaborador seleccionado y los pone en el formulario
 */
function cargarColaborador(id) {
    // 1. Buscamos al colaborador en el arreglo usando el método .find()
    const colaborador = listaColaboradores.find(function(c) {
        return c.id === id;
    });

    if (colaborador) {
        // 2. Llenamos los inputs con la información encontrada
        document.getElementById('nombre').value = colaborador.nombre;
        document.getElementById('apellido').value = colaborador.apellido;
        document.getElementById('cargo').value = colaborador.cargo;
        document.getElementById('correo').value = colaborador.correo;

        // 3. Activamos el modo edición guardando el ID actual
        idEdicion = id; 

        // 4. Cambiamos el texto del botón y borramos mensajes de éxito previos
        btnRegistrar.textContent = 'Actualizar Colaborador';
        btnCancelar.style.display = 'block';
        mensajeExito.textContent = '';
        
        // Hacemos que la pantalla suba al inicio suavemente para que el usuario vea el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

// EVENTO: Para el botón Cancelar Edición
btnCancelar.addEventListener('click', function() {
    // 1. Apagamos el modo edición
    idEdicion = null;
    
    // 2. Limpiamos los inputs
    formulario.reset();
    
    // 3. Restauramos la interfaz a como estaba al principio
    btnRegistrar.textContent = 'Registrar Colaborador';
    btnCancelar.style.display = 'none';
    limpiarMensajes();
});

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