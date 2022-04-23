require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool();

const getReservas = async () => {
    const consulta = "SELECT * FROM reservas FULL OUTER JOIN productos ON reservas.id_producto = productos.id_producto";
    console.log("-------- QUERY GET RESERVAS --------");
    const respuesta = await pool.query(consulta);
    return respuesta.rows;
}

module.exports = {
    getReservas
}