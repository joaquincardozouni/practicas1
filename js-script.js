// Función para inicializar los datos en localStorage desde el JSON de la biblioteca
async function inicializarDatos() {
    if (!localStorage.getItem("usuarios") || !localStorage.getItem("libros") || !localStorage.getItem("prestamos")) {
        try {
            const response = await fetch("../data/datos.json"); // Ajusta la ruta si es necesario (ej: "data/datos.json" según dónde esté tu script)
            const data = await response.json();
            
            // Guardamos en localStorage convirtiéndolos a texto con JSON.stringify
            localStorage.setItem("usuarios", JSON.stringify(data.usuarios));
            localStorage.setItem("libros", JSON.stringify(data.libros));
            localStorage.setItem("prestamos", JSON.stringify(data.prestamos));
        } catch (error) {
            console.error("Error al cargar los datos iniciales de BiblioTech:", error);
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await inicializarDatos();

    // 1. LÓGICA DE LOGIN (Si tienes un formulario de inicio de sesión)
    const formLogin = document.querySelector("#form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();

            const emailInput = document.querySelector("#email").value;
            const passwordInput = document.querySelector("#password").value;

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

            const usuarioEncontrado = usuarios.find(
                u => u.email === emailInput && u.password === passwordInput
            );

            if (usuarioEncontrado) {
                localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioEncontrado));
                alert(`¡Bienvenido/a, ${usuarioEncontrado.nombre}!`);
                window.location.href = "../index.html"; 
            } else {
                alert("Credenciales incorrectas.");
            }
        });
    }

    // 2. LÓGICA DEL FORMULARIO DE SOLICITUD DE PRÉSTAMO
    const formSolicitud = document.querySelector("#form-solicitud");
    if (formSolicitud) {
        formSolicitud.addEventListener("submit", (e) => {
            e.preventDefault();

            const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
            const socio = document.querySelector("#socio").value;
            const libroTitulo = document.querySelector("#libro").value;
            const modalidad = document.querySelector("#modalidad").value;

            const prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

            // Validar límite de 3 préstamos activos[cite: 2]
            const prestamosActivos = prestamos.filter(p => (p.estado || 'Activo') === 'Activo');
            if (prestamosActivos.length >= 3) {
                alert("Has alcanzado el límite máximo de 3 préstamos activos[cite: 2].");
                return;
            }

            const nuevoPrestamo = {
                id: prestamos.length > 0 ? prestamos[prestamos.length - 1].id + 1 : 1,
                usuarioId: usuarioLogueado ? usuarioLogueado.id : 1,
                socio: socio,
                libroTitulo: libroTitulo,
                modalidad: modalidad,
                fechaLimite: "25/08/2026",
                estado: "Activo"
            };

            prestamos.push(nuevoPrestamo);
            localStorage.setItem("prestamos", JSON.stringify(prestamos));

            alert("¡Préstamo registrado con éxito!");
            window.location.href = "confirmacion.html";
        });
    }

    // Ejecutar funciones de renderizado según la página en la que estemos
    renderizarCatalogoInicio();
    renderizarMisPrestamos();
    mostrarComprobante();
});

// A. Renderizar el catálogo en el index.html
function renderizarCatalogoInicio() {
    const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
    if (contenedorCatalogo) {
        const libros = JSON.parse(localStorage.getItem("libros")) || [];
        contenedorCatalogo.innerHTML = "";

        libros.forEach(libro => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-libro");
            tarjeta.innerHTML = `
                <h3>${libro.titulo}</h3>
                <p><b>Autor:</b> ${libro.autor}</p>
                <p><b>Estado:</b> ${libro.estado}</p>
                <a href="pages/solicitar-prestamo.html">Pedir este libro</a>
            `;
            contenedorCatalogo.appendChild(tarjeta);
        });
    }
}

// B. Renderizar la tabla en mis-prestamos.html
function renderizarMisPrestamos() {
    const tbody = document.querySelector("#tabla-prestamos-body");
    if (tbody) {
        const prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];
        tbody.innerHTML = "";

        if (prestamos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No tienes préstamos registrados.</td></tr>`;
            return;
        }

        prestamos.forEach(prestamo => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${prestamo.libroTitulo}</td>
                <td>${prestamo.modalidad}</td>
                <td>${prestamo.fechaLimite}</td>
                <td>${prestamo.estado || 'Activo'}</td>
            `;
            tbody.appendChild(tr);
        });

        const activos = prestamos.filter(p => (p.estado || 'Activo') === 'Activo').length;
        const textoCupo = document.querySelector("#texto-cupo");
        if (textoCupo) {
            textoCupo.textContent = `${activos} de 3 libros`;
        }
    }
}

// C. Mostrar el comprobante en confirmacion.html
function mostrarComprobante() {
    const socioSpan = document.querySelector("#comp-socio");
    if (socioSpan) {
        const prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];
        if (prestamos.length > 0) {
            const ultimo = prestamos[prestamos.length - 1];
            document.querySelector("#comp-socio").textContent = ultimo.socio;
            document.querySelector("#comp-libro").textContent = ultimo.libroTitulo;
            document.querySelector("#comp-modalidad").textContent = ultimo.modalidad;
            document.querySelector("#comp-fecha").textContent = ultimo.fechaLimite;
        }
    }
}