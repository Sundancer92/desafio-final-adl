require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

const getReservas = async () => {
	const consulta = `SELECT
	spc.id_spc,
	spc.presupuesto_max AS presupuesto_max,
	spc.presupuesto_min AS presupuesto_min,
	spc.comentario AS comentario,
	estado.nombre AS estado_spc,
	cliente.id_cliente,
	cliente.nombre AS nombre_cliente,
	cliente.apellido AS apellido_cliente,
	cliente.telefono AS telefono_cliente,
	cliente.email AS email_cliente,
	disciplina.nombre AS disciplina_producto,
	talla.nombre AS talla_producto,
	material.nombre AS material_1_producto,
	sexo_cliente.nombre AS sexo_cliente,
	producto.id_producto AS producto,
	sexo_producto.nombre AS sexo_producto,
	marca.nombre AS marca_producto,
	componente_1.nombre AS componente_1_producto
FROM
	solicitud_pedido_cliente spc
	FULL OUTER JOIN productos producto
	ON spc.id_producto = producto.id_producto
	INNER JOIN disciplinas disciplina 
	ON producto.id_disciplina_1 = disciplina.id_disciplina
	INNER JOIN tallas talla 
	ON producto.id_talla = talla.id_talla
	INNER JOIN materiales material 
	ON producto.id_material = material.id_material
	INNER JOIN estados_spc estado
	ON spc.id_estado = estado.id_estado
	INNER JOIN clientes cliente
	ON spc.id_cliente = cliente.id_cliente
	INNER JOIN sexos sexo_cliente
	ON cliente.id_sexo = sexo_cliente.id_sexo
	INNER JOIN sexos sexo_producto
	ON producto.id_sexo = sexo_producto.id_sexo
	INNER JOIN marcas marca
	ON producto.id_marca = marca.id_marca
	INNER JOIN marcas componente_1
	ON producto.id_prioridad_componente_1 = componente_1.id_marca
	ORDER BY spc.fecha_reserva DESC;
	`;

	const respuesta = await pool.query(consulta);

	// console.log("-------- RESPUESTA GET RESERVAS --------");
	// console.log(respuesta.rows);

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
	const consultaEstados = "SELECT nombre FROM estados_spc";

	const respuestaSexos = await pool.query(consultaSexos);
	const respuestaDisciplinas = await pool.query(consultaDisciplinas);
	const respuestaMarcas = await pool.query(consultaMarcas);
	const respuestaComponentes = await pool.query(consultaComponentes);
	const respuestaMateriales = await pool.query(consultaMateriales);
	const respuestaTallas = await pool.query(consultaTallas);
	const respuestaEstados = await pool.query(consultaEstados);

	const respuesta = {
		sexos: respuestaSexos.rows,
		disciplinas: respuestaDisciplinas.rows,
		marcas: respuestaMarcas.rows,
		componentes: respuestaComponentes.rows,
		materiales: respuestaMateriales.rows,
		tallas: respuestaTallas.rows,
		estados: respuestaEstados.rows,
	};

	return respuesta;
};

const postNuevaReserva = async (data) => {
	// console.log("-------- QUERY POST NUEVA RESERVA --------");
	// console.log(data);

	const clienteExiste = await getCliente(data.id_cliente);

	const crearCliente = `INSERT INTO clientes 
		(id_cliente, nombre, apellido, email, telefono, id_sexo) 
		VALUES 
		(
			$1,
			$2, 
			$3, 
			$4, 
			$5, 
			(SELECT id_sexo FROM sexos WHERE nombre = $6)
		) RETURNING *`;

	const crearProducto = `INSERT INTO productos 
		(id_marca, id_disciplina_1, id_prioridad_componente_1, id_talla, id_material, id_sexo) 
		VALUES 
		(
			(SELECT id_marca FROM marcas WHERE nombre=$1 LIMIT 1),
			(SELECT id_disciplina FROM disciplinas WHERE nombre=$2),
			(SELECT id_marca FROM marcas WHERE nombre=$3 LIMIT 1),
			(SELECT id_talla FROM tallas WHERE nombre=$4),
			(SELECT id_material FROM materiales WHERE nombre=$5),
			(SELECT id_sexo FROM sexos WHERE nombre=$6)
		) RETURNING *`;

	const crearSPC = `INSERT INTO solicitud_pedido_cliente 
		(id_cliente, id_producto, presupuesto_min, presupuesto_max, id_estado, comentario) 
		VALUES 
		(
			$1,
			$2,
			$3,
			$4,
			(SELECT id_estado FROM estados_spc WHERE nombre=$5),
			$6
		) RETURNING *`;

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
		}

		const respuestaCrearProducto = await pool.query(crearProducto, [
			data.marca_producto,
			data.disciplina_producto,
			data.componente_1_producto,
			data.talla_producto,
			data.material_1_producto,
			data.sexo_producto,
		]);

		const respuestaCrearSPC = await pool.query(crearSPC, [
			data.id_cliente,
			respuestaCrearProducto.rows[0].id_producto,
			data.presupuesto_min_reserva,
			data.presupuesto_max_reserva,
			"Abierto",
			data.comentarios_reserva,
		]);

		pool.query("COMMIT");
		return true;
	} catch (error) {
		console.log("-------- ERROR CREAR CLIENTE --------");
		pool.query("ROLLBACK");
		console.log(error);
		return false;
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
		return respuesta.rows[0];
	} catch (error) {
		console.log("-------- ERROR GET CLIENTE --------");
		console.log(error);
	}
};

const getDetalleSPC = async (id_spc) => {
	const consulta = `SELECT
	spc.id_spc,
	spc.id_producto AS id_producto,
	spc.presupuesto_max AS presupuesto_max,
	spc.presupuesto_min AS presupuesto_min,
	spc.comentario AS comentario,
	estado.nombre AS estado_spc,
	cliente.id_cliente,
	cliente.nombre AS nombre_cliente,
	cliente.apellido AS apellido_cliente,
	cliente.telefono AS telefono_cliente,
	cliente.email AS email_cliente,
	disciplina.nombre AS disciplina_producto,
	talla.nombre AS talla_producto,
	material.nombre AS material_1_producto,
	sexo_cliente.nombre AS sexo_cliente,
	producto.id_producto AS producto,
	sexo_producto.nombre AS sexo_producto,
	marca.nombre AS marca_producto,
	componente_1.nombre AS componente_1_producto
FROM
	solicitud_pedido_cliente spc
	FULL OUTER JOIN productos producto
	ON spc.id_producto = producto.id_producto
	INNER JOIN disciplinas disciplina 
	ON producto.id_disciplina_1 = disciplina.id_disciplina
	INNER JOIN tallas talla 
	ON producto.id_talla = talla.id_talla
	INNER JOIN materiales material 
	ON producto.id_material = material.id_material
	INNER JOIN estados_spc estado
	ON spc.id_estado = estado.id_estado
	INNER JOIN clientes cliente
	ON spc.id_cliente = cliente.id_cliente
	INNER JOIN sexos sexo_cliente
	ON cliente.id_sexo = sexo_cliente.id_sexo
	INNER JOIN sexos sexo_producto
	ON producto.id_sexo = sexo_producto.id_sexo
	INNER JOIN marcas marca
	ON producto.id_marca = marca.id_marca
	INNER JOIN marcas componente_1
	ON producto.id_prioridad_componente_1 = componente_1.id_marca
	WHERE spc.id_spc = $1`;

	const respuesta = await pool.query(consulta, [id_spc]);

	// console.log("-------- RESPUESTA GET DETALLES SPC --------");
	// console.log(respuesta.rows[0]);

	return respuesta.rows[0];
};

const actualizarEstadoSPC = async (data) => {
	//console.log("-------- QUERY ACTUALIZAR ESTADO --------");
	const consultaIdEstado = `
	SELECT id_estado
	FROM estados_spc
	WHERE nombre = $1
	`;
	const consultaNuevoEstado = `
	UPDATE solicitud_pedido_cliente
	SET id_estado = $1
	WHERE id_spc = $2
	`;

	try {
		pool.query("BEGIN");
		const respuestaIdEstado = await pool.query(consultaIdEstado, [
			data.nuevoEstado,
		]);

		const respuestaNuevoEstado = await pool.query(consultaNuevoEstado, [
			respuestaIdEstado.rows[0].id_estado,
			data.id_spc,
		]);
		pool.query("COMMIT");
	} catch (error) {
		pool.query("ROLLBACK");
		console.log("-------- ERROR ACTUALIZAR ESTADO --------");
		console.log(error);
	}
	return true;
};

const actualizarSPC = async (id_spc, data) => {
	//console.log("-------- QUERY ACTUALIZAR SPC --------");
	//console.log(id_spc);
	//console.log(data);

	const actualizarCliente = `
	UPDATE clientes
	SET nombre = $1,
	apellido = $2,
	telefono = $3,
	email = $4,
	id_sexo = (SELECT id_sexo FROM sexos WHERE nombre = $5 LIMIT 1)
	WHERE id_cliente = $6
	`;

	const actualizarProducto = `
	UPDATE productos
	SET id_disciplina_1 = (SELECT id_disciplina FROM disciplinas WHERE nombre = $1),
	id_marca = (SELECT id_marca FROM marcas WHERE nombre=$2 LIMIT 1),
	id_sexo = (SELECT id_sexo FROM sexos WHERE nombre = $3),
	id_prioridad_componente_1 = (SELECT id_marca FROM marcas WHERE nombre=$4 LIMIT 1),
	id_material = (SELECT id_material FROM materiales WHERE nombre = $5),
	id_talla = (SELECT id_talla FROM tallas WHERE nombre = $6)
	WHERE id_producto = $7
	`;

	const actualizarSPC = `
	UPDATE solicitud_pedido_cliente
	SET presupuesto_min = $1,
	presupuesto_max = $2,
	comentario = $3
	WHERE id_spc = $4
	`;

	try {
		pool.query("BEGIN");
		const respuestaActualizarCliente = await pool.query(actualizarCliente, [
			data.nombre_cliente,
			data.apellido_cliente,
			data.telefono_cliente,
			data.email_cliente,
			data.sexo_cliente,
			data.id_cliente,
		]);
		// console.log("-------- RESPUESTA ACTUALIZAR CLIENTE --------");
		// console.log(respuestaActualizarCliente);

		const respuestaActualizarProducto = await pool.query(actualizarProducto, [
			data.disciplina_producto,
			data.marca_producto,
			data.sexo_producto,
			data.componente_1_producto,
			data.material_1_producto,
			data.talla_producto,
			data.id_producto,
		]);

		//console.log("-------- RESPUESTA ACTUALIZAR PRODUCTO --------");
		//console.log(respuestaActualizarProducto);

		const respuestaActualizarSPC = await pool.query(actualizarSPC, [
			data.presupuesto_min_reserva,
			data.presupuesto_max_reserva,
			data.comentarios_reserva,
			id_spc,
		]);

		//console.log("-------- RESPUESTA ACTUALIZAR SPC --------");
		//console.log(respuestaActualizarSPC);

		pool.query("COMMIT");
		return true;
	} catch (error) {
		console.log("-------- ERROR ACTUALIZAR CLIENTE --------");
		console.log(error);
	}
};

const eliminarSPC = async (id_spc) => {
	//console.log("-------- QUERY ELIMINAR SPC --------");
	//console.log(id_spc);

	const consulta = `
	DELETE FROM solicitud_pedido_cliente
	WHERE id_spc = $1
	`;

	const respuesta = await pool.query(consulta, [id_spc]);

	//console.log("-------- RESPUESTA ELIMINAR SPC --------");
	//console.log(respuesta);

	return true;
}

const comprobarLogIN = async (correo, contrasena) => {
	// console.log("-------- QUERY COMPROBAR LOGIN --------");

	const buscarUsuario = `
	SELECT * FROM usuarios
	WHERE correo = $1
	AND contrasena = $2
	`;

	const buscarRolUsuario = `
		SELECT nombre
		FROM roles_usuarios
		WHERE id_rol = $1
	`
	try{
		pool.query("BEGIN");
		const respuestaBuscarUsuario = await pool.query(buscarUsuario, [correo, contrasena]);

		if(respuestaBuscarUsuario.rows.length > 0){
			const respuestaBuscarRolUsuario = await pool.query(buscarRolUsuario, [respuestaBuscarUsuario.rows[0].id_rol_usuario]);
			//console.log("-------- RESPUESTA Buscar USUARIO --------");
			
		pool.query("COMMIT");
			return {
				id_usuario: respuestaBuscarUsuario.rows[0].id_usuario,
				nombre: respuestaBuscarUsuario.rows[0].nombre,
				correo: respuestaBuscarUsuario.rows[0].correo,
				contrasena: respuestaBuscarUsuario.rows[0].contrasena,
				rol_usuario: respuestaBuscarRolUsuario.rows[0].nombre,
			}
		}

	} catch(error) {
		pool.query("ROLLBACK");
		console.log("-------- ERROR COMPROBAR LOGIN --------");
		return {error: error}
	}
}

module.exports = {
	getReservas,
	postNuevaReserva,
	getCliente,
	getCamposPredefinidosFormularioSPC,
	getDetalleSPC,
	actualizarEstadoSPC,
	actualizarSPC,
	eliminarSPC,
	comprobarLogIN,
};
