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

app.use("/public", express.static(__dirname + "/public"));

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
		partialsDir: __dirname + "/views/componentes/",
	}),
);
// * FIN Configuracion de handlebars
// ! --------------------- FIN CONFIG----------------------------

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// ? --------------------- QUERYS ----------------------------
const { getReservas } = require("./DB/querys");
// ? --------------------- FIN QUERYS ----------------------------

// ! ---------------------RUTAS----------------------------

app.get("/", (req, res) => {
	res.render("Inicio", {
		layout: "Inicio",
	});
});

// * API REST

app.get("/reservas", async (req, res) => {
	const reservas = await getReservas();
	console.log("------- API GET RESERVAS --------");
	console.log(reservas);
	res.end(JSON.stringify(reservas));
});
