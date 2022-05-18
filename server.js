const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ! ---------------------CONFIG----------------------------
require("dotenv").config();
app.use(cookieParser());
// * Puerto para heroku
const port = process.env.PORT || 3000;
// * Puerto para heroku

app.use("/static", express.static("public"));

// * Invocacion bootstrap
app.use(
	"/bootstrap",
	express.static(__dirname + "/node_modules/bootstrap/dist/css"),
);
app.use(
	"/BootstrapJs",
	express.static(__dirname + "/node_modules/bootstrap/dist/js/"),
);
// * FIN Invocacion bootstrap

// * Configuracion de handlebars
app.set("view engine", "handlebars");

app.engine(
	"handlebars",
	exphbs.engine({
		layoutsDir: __dirname + "/views",
		partialsDir: __dirname + "/views/componentes",
	}),
);
// * FIN Configuracion de handlebars
// ! --------------------- FIN CONFIG----------------------------

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// ? --------------------- QUERYS ----------------------------
const {
	getReservas,
	postNuevaReserva,
	getCliente,
	getCamposPredefinidosFormularioSPC,
	getDetalleSPC,
	actualizarEstadoSPC,
	actualizarSPC,
} = require("./DB/querys");
// ? --------------------- FIN QUERYS ----------------------------

// ! --------------------- RUTAS ----------------------------

app.get("/", async (req, res) => {
	const camposPredefinidosFormulario =
		await getCamposPredefinidosFormularioSPC();

	res.render("Inicio", {
		layout: "Inicio",
		sexo: camposPredefinidosFormulario.sexos,
		disciplina: camposPredefinidosFormulario.disciplinas,
		marca: camposPredefinidosFormulario.marcas,
		componente: camposPredefinidosFormulario.componentes,
		material: camposPredefinidosFormulario.materiales,
		talla: camposPredefinidosFormulario.tallas,
		estado: camposPredefinidosFormulario.estados,
	});
});

app.get("/dashboard", async (req, res) => {
	const reservas = await getReservas();
	const camposPredefinidosFormulario =
		await getCamposPredefinidosFormularioSPC();

	res.render("Dashboard", {
		layout: "Dashboard",
		reserva: reservas,
		sexos: camposPredefinidosFormulario.sexos,
		disciplinas: camposPredefinidosFormulario.disciplinas,
		marcas: camposPredefinidosFormulario.marcas,
		componentes: camposPredefinidosFormulario.componentes,
		materiales: camposPredefinidosFormulario.materiales,
		tallas: camposPredefinidosFormulario.tallas,
		estados: camposPredefinidosFormulario.estados,
		predefinidos: camposPredefinidosFormulario,
	});
});

app.get("/detalle-spc/:id", async (req, res) => {
	const id_spc = req.params.id;
	const detalleSPC = await getDetalleSPC(id_spc);
	const camposPredefinidosFormulario =
		await getCamposPredefinidosFormularioSPC();

		// console.log(detalleSPC);

	res.render("DetalleSPC", {
		layout: "DetalleSPC",
		id_spc: id_spc,
		estado: detalleSPC.estado_spc,
		id_cliente: detalleSPC.id_cliente,
		sexo_cliente: detalleSPC.sexo_cliente,
		nombre_cliente: detalleSPC.nombre_cliente,
		apellido_cliente: detalleSPC.apellido_cliente,
		email_cliente: detalleSPC.email_cliente,
		telefono_cliente: detalleSPC.telefono_cliente,
		disciplina_producto: detalleSPC.disciplina_producto,
		marca_producto: detalleSPC.marca_producto,
		sexo_producto: detalleSPC.sexo_producto,
		componente_1_producto: detalleSPC.componente_1_producto,
		material_1_producto: detalleSPC.material_1_producto,
		talla_producto: detalleSPC.talla_producto,
		presupuesto_max: detalleSPC.presupuesto_max,
		presupuesto_min: detalleSPC.presupuesto_min,
		id_producto: detalleSPC.id_producto,
		comentario_spc: detalleSPC.comentario,
		sexos: camposPredefinidosFormulario.sexos,
		disciplinas: camposPredefinidosFormulario.disciplinas,
		marcas: camposPredefinidosFormulario.marcas,
		componentes: camposPredefinidosFormulario.componentes,
		materiales: camposPredefinidosFormulario.materiales,
		tallas: camposPredefinidosFormulario.tallas,
		estados: camposPredefinidosFormulario.estados,
		predefinidos: camposPredefinidosFormulario,

	})
})

// ! ------------------- FIN RUTAS ----------------------------

// * API REST

app.get("/reservas", async (req, res) => {
	const reservas = await getReservas();
	// console.log(reservas);
	// console.log("------- API GET RESERVAS --------");
	// console.log(reservas);

	res.end(JSON.stringify(reservas));
});

app.post("/nuevaReserva", async (req, res) => {
	const data = req.body;

	const statusNuevaReserva = await postNuevaReserva(data);
});

app.get("/buscarCliente", async (req, res) => {
	//console.log("------- API BUSCAR CLIENTE --------");
	const id_cliente = req.query.id_cliente;

	const cliente = await getCliente(id_cliente);

	if (!cliente) {
		res.status(404);
		res.send("no-content");
	}

	res.end(JSON.stringify(cliente));
});

app.put("/actualizarEstado", async (req, res) => {
	//console.log("------- API ACTUALIZAR ESTADO --------");
	const data = req.body.data;
	const statusActualizarEstado = await actualizarEstadoSPC(data);

	if (statusActualizarEstado) {
		res.status(200);
		res.send("OK");
	} else {
		res.status(500);
		res.send("ERROR");
	}
})

app.put("/actualizarSPC/:id", async (req, res) => {
	const id_spc = req.params.id;
	const data = req.body;

	 console.log("------- API ACTUALIZAR SPC --------");
	 console.log(data);

	/*
	*/

	 const respuestaActualizarSPC = await actualizarSPC(id_spc, data);

	// if (statusActualizarSPC) {
	// 	res.status(200);
	// 	res.send("OK");
	// } else {
	// 	res.status(500);
	// 	res.send("ERROR");
	// }
})