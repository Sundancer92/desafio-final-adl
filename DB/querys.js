require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

const getReservas = async () => {
	const consulta =
		"SELECT * FROM solicitud_pedido_cliente FULL OUTER JOIN productos ON solicitud_pedido_cliente.id_producto = productos.id_producto";

	const respuesta = await pool.query(consulta);

	// console.log("-------- QUERY GET SPC --------");
	// ! RESPUESTA
	// {
	//     id_cliente: '22.888.666-2',
	//     nombre_cliente: 'Lucas',
	//     apellido_cliente: 'Duque',
	//     email_cliente: 'lucas.duque@gmail.com',
	//     telefono_cliente: '59991216308',
	//     nombre_producto: 'Nuroad',
	//     marca_producto: 'CUBE',
	//     talla_producto: 'XL',
	//     presupuesto_reserva: '6000000',
	//     disciplina_producto: 'Trail',
	//     comentarios_reserva: 'Ayuda'
	//   }

	return respuesta.rows;
};

const getCamposPredefinidosFormularioSPC = async () => {
	const consultaSexos = "SELECT nombre FROM sexos";
	const consultaDisciplinas = "SELECT nombre FROM disciplinas";
	const consultaMarcas = "SELECT nombre FROM marcas WHERE tipo_1 = 'Cuadro'";
	const consultaComponentes =
		"SELECT nombre FROM marcas WHERE tipo_1 = 'Componente'";
	const consultaMateriales = "SELECT nombre FROM materiales";
	const consultaTallas = "SELECT nombre FROM tallas";

	const respuestaSexos = await pool.query(consultaSexos);
	const respuestaDisciplinas = await pool.query(consultaDisciplinas);
	const respuestaMarcas = await pool.query(consultaMarcas);
	const respuestaComponentes = await pool.query(consultaComponentes);
	const respuestaMateriales = await pool.query(consultaMateriales);
	const respuestaTallas = await pool.query(consultaTallas);

	const respuesta = {
		sexos: respuestaSexos.rows,
		disciplinas: respuestaDisciplinas.rows,
		marcas: respuestaMarcas.rows,
		componentes: respuestaComponentes.rows,
		materiales: respuestaMateriales.rows,
		tallas: respuestaTallas.rows,
	};

	return respuesta;
};

const postNuevaReserva = async (data) => {
	console.log("-------- QUERY POST NUEVA RESERVA --------");
	console.log(data);

	// {
	// 	id_cliente: '11111111-1',
	// 	sexo_cliente: 'Hombre',
	// 	nombre_cliente: 'Suerte',
	// 	apellido_cliente: 'Santo',
	// 	email_cliente: 'serte@gmail.com',
	// 	telefono_cliente: '56991213068',
	// 	disciplina_producto: 'Gravel',
	// 	marca_producto: 'CUBE',
	// 	sexo_producto: 'Mujer',
	// 	componente_1_producto: 'Sram',
	// 	material_1_producto: 'Aluminio',
	// 	talla_producto: 'M',
	// 	presupuesto_min_reserva: '500000',
	// 	presupuesto_max_reserva: '15421542',
	// 	comentarios_reserva: 'Sin comentarios papa\n'
	//   }

	const clienteExiste = await getCliente(data.id_cliente);

	const crearCliente =
		"INSERT INTO clientes (id_cliente, nombre, apellido, email, telefono, id_sexo) VALUES ($1, $2, $3, $4, $5, (SELECT id_sexo FROM sexos WHERE nombre = $6)) RETURNING *";

	const crearProducto =
		"INSERT INTO productos (id_marca, disciplina_1, prioridad_componente,) VALUES ($1, (SELECT id_marca FROM marcas WHERE nombre = $2), $3) RETURNING *";

	const crearSPC = `INSERT INTO solicitud_pedido_cliente (id_cliente, id_producto, disciplina, presupuesto, estado, comentario) VALUES ($1, (SELECT id_producto from productos WHERE id_producto = $2), $3, $4, 'Pendiente', $5) RETURNING *`;

	try {
		pool.query("BEGIN");

		if (!clienteExiste) {
			const respuestaCrearCliente = await pool.query(crearCliente, [
				data.id_cliente,
				data.nombre_cliente,
				data.apellido_cliente,
				data.email_cliente,
				data.telefono_cliente,
				data.sexo_cliente,
			]);
			// console.log("-------- RESPUESTA CREAR CLIENTE --------");
		}

		const respuestaCrearProducto = await pool.query(crearProducto, [
			data.nombre_producto,
			data.marca_producto,
			data.talla_producto,
		]);
		// console.log("-------- RESPUESTA CREAR PRODUCTO --------");
		// console.log(respuestaCrearProducto.rows[0]);

		const respuestaCrearSPC = await pool.query(crearSPC, [
			data.id_cliente,
			respuestaCrearProducto.rows[0].id_producto,
			data.disciplina_producto,
			data.presupuesto_reserva,
			data.comentarios_reserva,
		]);
		// console.log("-------- RESPUESTA CREAR RESERVA --------");
		// console.log(respuestaCrearSPC.rows[0]);

		pool.query("COMMIT");
	} catch (error) {
		console.log("-------- ERROR CREAR CLIENTE --------");
		pool.query("ROLLBACK");
		console.log(error);
	}
};

const getCliente = async (id_cliente) => {
	// console.log("-------- QUERY GET CLIENTE --------");
	//  console.log(id_cliente);

	try {
		const consulta = "SELECT * FROM clientes WHERE id_cliente = $1";
		const respuesta = await pool.query(consulta, [id_cliente]);

		// console.log("-------- RESPUESTA GET CLIENTE --------");
		// console.log(respuesta.rows[0]);

		if (respuesta.rows.length > 0) {
			const consultaSexo = "SELECT nombre FROM sexos WHERE id_sexo = $1";
			const respuestaSexo = await pool.query(consultaSexo, [
				respuesta.rows[0].id_sexo,
			]);

			respuesta.rows[0].id_sexo = respuestaSexo.rows[0].nombre;
		}

		console.log(respuesta.rows);

		return respuesta.rows[0];
	} catch (error) {
		console.log("-------- ERROR GET CLIENTE --------");
		console.log(error);
	}
};

module.exports = {
	getReservas,
	postNuevaReserva,
	getCliente,
	getCamposPredefinidosFormularioSPC,
};
