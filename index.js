const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// Gestión de Reservas
app.get("/obtenerReservas", (req, res) => {
    let archivo = fs.readFileSync("reservas.json", "utf8");
    const reservas = JSON.parse(archivo);
    res.send(reservas);
});

app.get("/buscarReserva/:id", (req, res) => {
    const idReserva = req.params.id;
    let archivo = fs.readFileSync("reservas.json", "utf8");
    const reservas = JSON.parse(archivo);

    const reserva = reservas.find(r => r.id === idReserva);
    if (reserva) {
        res.send(reserva);
    } else {
        res.status(404).send({ mensaje: "Reserva no encontrada." });
    }
});

app.post("/crearReserva", (req, res) => {
    const nuevaReserva = req.body;
    let archivo = fs.readFileSync("reservas.json", "utf8");
    let reservas = JSON.parse(archivo);

    // Filtrar reservas por el número de habitación
    const reservasHabitacion = reservas.filter(reserva => reserva.numero === nuevaReserva.numero);

    // Convertir fechas a objetos Date para poder comparar
    const fechaEntradaNueva = new Date(nuevaReserva.fechaEntrada);
    const fechaSalidaNueva = new Date(nuevaReserva.fechaSalida);

    console.log("Nueva reserva:", fechaEntradaNueva, fechaSalidaNueva);

    // Verificar solapamiento de fechas
    const conflicto = reservasHabitacion.some(reserva => {
        const fechaEntradaExistente = new Date(reserva.fechaEntrada);
        const fechaSalidaExistente = new Date(reserva.fechaSalida);

        console.log("Reserva existente:", fechaEntradaExistente, fechaSalidaExistente);

        // Comprobar si las fechas de la nueva reserva se solapan con las fechas existentes
        const solapamiento = (fechaEntradaNueva <= fechaSalidaExistente && fechaSalidaNueva >= fechaEntradaExistente);
        console.log("Solapamiento:", solapamiento);
        return solapamiento;
    });

    if (conflicto) {
        res.status(400).send({ mensaje: "No se puede reservar, habitación en uso." });
    } else {
        reservas.push(nuevaReserva);
        fs.writeFileSync("reservas.json", JSON.stringify(reservas, null, 2));
        res.send({ mensaje: "Reserva creada exitosamente.", reserva: nuevaReserva });
    }
});



app.put("/modificarReserva/:id", (req, res) => {
    const idReserva = req.params.id;
    const datosModificados = req.body;
    let archivo = fs.readFileSync("reservas.json", "utf8");
    let reservas = JSON.parse(archivo);

    const reserva = reservas.find(r => r.id === idReserva);
    if (reserva) {
        Object.assign(reserva, datosModificados);
        fs.writeFileSync("reservas.json", JSON.stringify(reservas, null, 2));
        res.send({ mensaje: "Reserva modificada exitosamente." });
    } else {
        res.status(404).send({ mensaje: "Reserva no encontrada." });
    }
});

app.delete("/cancelarReserva/:id", (req, res) => {
    const idReserva = req.params.id;
    let archivo = fs.readFileSync("reservas.json", "utf8");
    let reservas = JSON.parse(archivo);

    const nuevasReservas = reservas.filter(r => r.id !== idReserva);
    fs.writeFileSync("reservas.json", JSON.stringify(nuevasReservas, null, 2));
    res.send({ mensaje: "Reserva cancelada exitosamente." });
});

// Gestión de Habitaciones
app.get("/obtenerHabitaciones", (req, res) => {
    let archivo = fs.readFileSync("habitaciones.json", "utf8");
    const habitaciones = JSON.parse(archivo);
    res.send(habitaciones);
});

app.get("/buscarHabitacion/:numero", (req, res) => {
    const numeroHabitacion = req.params.numero;
    let archivo = fs.readFileSync("habitaciones.json", "utf8");
    const habitaciones = JSON.parse(archivo);

    const habitacion = habitaciones.find(h => h.numero === numeroHabitacion);
    if (habitacion) {
        res.send(habitacion);
    } else {
        res.status(404).send({ mensaje: "Habitación no encontrada." });
    }
});

app.put("/actualizarEstadoHabitacion/:numero", (req, res) => {
    const numeroHabitacion = req.params.numero;
    const nuevoEstado = req.body.estado;
    let archivo = fs.readFileSync("habitaciones.json", "utf8");
    let habitaciones = JSON.parse(archivo);

    const habitacion = habitaciones.find(h => h.numero === numeroHabitacion);
    if (habitacion) {
        habitacion.estado = nuevoEstado;
        fs.writeFileSync("habitaciones.json", JSON.stringify(habitaciones, null, 2));
        res.send({ mensaje: "Estado de la habitación actualizado." });
    } else {
        res.status(404).send({ mensaje: "Habitación no encontrada." });
    }
});

// Gestión de Servicios
app.get("/obtenerServicios", (req, res) => {
    let archivo = fs.readFileSync("servicios.json", "utf8");
    const servicios = JSON.parse(archivo);
    res.send(servicios);
});

app.get("/buscarServicio/:nombre", (req, res) => {
    const nombreServicio = req.params.nombre;
    let archivo = fs.readFileSync("servicios.json", "utf8");
    const servicios = JSON.parse(archivo);

    const servicio = servicios.find(s => s.nombre.toLowerCase() === nombreServicio.toLowerCase());
    if (servicio) {
        res.send(servicio);
    } else {
        res.status(404).send({ mensaje: "Servicio no encontrado." });
    }
});

app.post("/agregarServicio", (req, res) => {
    const nuevoServicio = req.body;
    let archivo = fs.readFileSync("servicios.json", "utf8");
    let servicios = JSON.parse(archivo);

    servicios.push(nuevoServicio);
    fs.writeFileSync("servicios.json", JSON.stringify(servicios, null, 2));
    res.send({ mensaje: "Servicio añadido exitosamente.", servicio: nuevoServicio });
});

// Facturación y Pagos
app.get("/obtenerFacturas", (req, res) => {
    let archivo = fs.readFileSync("facturas.json", "utf8");
    const facturas = JSON.parse(archivo);
    res.send(facturas);
});

app.get("/buscarFactura/:id", (req, res) => {
    const idFactura = req.params.id;
    let archivo = fs.readFileSync("facturas.json", "utf8");
    const facturas = JSON.parse(archivo);

    const factura = facturas.find(f => f.id === idFactura);
    if (factura) {
        res.send(factura);
    } else {
        res.status(404).send({ mensaje: "Factura no encontrada." });
    }
});

app.post("/generarFactura", (req, res) => {
    const nuevaFactura = req.body;
    let archivo = fs.readFileSync("facturas.json", "utf8");
    let facturas = JSON.parse(archivo);

    facturas.push(nuevaFactura);
    fs.writeFileSync("facturas.json", JSON.stringify(facturas, null, 2));
    res.send({ mensaje: "Factura generada exitosamente.", factura: nuevaFactura });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
