CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE marcas(
    id_marca SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    tipo_1 VARCHAR(20) NOT NULL,
    tipo_2 VARCHAR(20),
    PRIMARY KEY(id_marca)
);


INSERT INTO marcas(nombre, tipo_1) VALUES('Cualquiera', 'Cuadro');
INSERT INTO marcas(nombre, tipo_1) VALUES('CUBE', 'Cuadro');
INSERT INTO marcas(nombre, tipo_1) VALUES('Giant', 'Cuadro');
INSERT INTO marcas(nombre, tipo_1) VALUES('Scott', 'Cuadro');
INSERT INTO marcas(nombre, tipo_1) VALUES('Liv', 'Cuadro');
INSERT INTO marcas(nombre, tipo_1) VALUES('Cualquiera', 'Componente');
INSERT INTO marcas(nombre, tipo_1) VALUES('Sram', 'Componente');
INSERT INTO marcas(nombre, tipo_1) VALUES('Shimano', 'Componente');
INSERT INTO marcas(nombre, tipo_1) VALUES('Magura', 'Componente');
INSERT INTO marcas(nombre, tipo_1) VALUES('Syncross', 'Componente');
INSERT INTO marcas(nombre, tipo_1) VALUES('Kilpi', ' Ropa');
INSERT INTO marcas(nombre, tipo_1) VALUES('ACID', 'Componente');
INSERT INTO marcas(nombre, tipo_1) VALUES('RFR', 'Componente');


CREATE TABLE sexos(
    id_sexo SERIAL UNIQUE,
    nombre VARCHAR(10) NOT NULL,
    PRIMARY KEY(id_sexo)
);

INSERT INTO sexos(nombre) VALUES('Cualquiera');
INSERT INTO sexos(nombre) VALUES('Hombre');
INSERT INTO sexos(nombre) VALUES('Mujer');


CREATE TABLE disciplinas(
    id_disciplina SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_disciplina)
);


INSERT INTO disciplinas(nombre) VALUES('Cualquiera');
INSERT INTO disciplinas(nombre) VALUES('Ruta');
INSERT INTO disciplinas(nombre) VALUES('MTB');
INSERT INTO disciplinas(nombre) VALUES('Gravel');
INSERT INTO disciplinas(nombre) VALUES('Downhill');
INSERT INTO disciplinas(nombre) VALUES('Enduro');
INSERT INTO disciplinas(nombre) VALUES('Cross Country');
INSERT INTO disciplinas(nombre) VALUES('Niño');

CREATE TABLE tallas(
    id_talla SERIAL UNIQUE,
    nombre VARCHAR(10) NOT NULL,
    PRIMARY KEY(id_talla)
);

INSERT INTO tallas(nombre) VALUES('XS');
INSERT INTO tallas(nombre) VALUES('S');
INSERT INTO tallas(nombre) VALUES('M');
INSERT INTO tallas(nombre) VALUES('L');
INSERT INTO tallas(nombre) VALUES('XL');
INSERT INTO tallas(nombre) VALUES('XXL');
INSERT INTO tallas(nombre) VALUES('48');
INSERT INTO tallas(nombre) VALUES('50');
INSERT INTO tallas(nombre) VALUES('52');
INSERT INTO tallas(nombre) VALUES('53');
INSERT INTO tallas(nombre) VALUES('54');
INSERT INTO tallas(nombre) VALUES('56');
INSERT INTO tallas(nombre) VALUES('58');
INSERT INTO tallas(nombre) VALUES('60');


CREATE TABLE materiales(
    id_material SERIAL UNIQUE,
    nombre VARCHAR(10) NOT NULL,
    PRIMARY KEY(id_material)
);

INSERT INTO materiales(nombre) VALUES('Cualquiera');
INSERT INTO materiales(nombre) VALUES('Aluminio');
INSERT INTO materiales(nombre) VALUES('Carbono');


CREATE TABLE clientes(
    id_cliente VARCHAR(11) UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    id_sexo INT NOT NULL,
    PRIMARY KEY(id_cliente),
    FOREIGN KEY(id_sexo) REFERENCES sexos(id_sexo)
);


CREATE TABLE productos(
    id_producto uuid DEFAULT uuid_generate_v4(),
    id_marca INT NOT NULL,
    id_disciplina_1 INT NOT NULL,
    id_disciplina_2 INT,
    id_prioridad_componente_1 INT,
    id_prioridad_componente_2 INT,
    id_talla INT NOT NULL,
    id_sexo INT NOT NULL,
    id_material INT NOT NULL,
    PRIMARY KEY(id_producto),
    FOREIGN KEY(id_marca) REFERENCES marcas(id_marca),
    FOREIGN KEY(id_disciplina_1) REFERENCES disciplinas(id_disciplina),
    FOREIGN KEY(id_disciplina_2) REFERENCES disciplinas(id_disciplina),
    FOREIGN KEY(id_prioridad_componente_1) REFERENCES marcas(id_marca),
    FOREIGN KEY(id_prioridad_componente_2) REFERENCES marcas(id_marca),
    FOREIGN KEY(id_talla) REFERENCES tallas(id_talla),
    FOREIGN KEY(id_material) REFERENCES materiales(id_material),
    FOREIGN KEY(id_sexo) REFERENCES sexos(id_sexo)
);


CREATE TABLE estados_spc(
    id_estado SERIAL UNIQUE,
    nombre VARCHAR(9) NOT NULL,
    PRIMARY KEY(id_estado)
);

INSERT INTO estados_spc(nombre) VALUES('Abierto');
INSERT INTO estados_spc(nombre) VALUES('En CD');
INSERT INTO estados_spc(nombre) VALUES('Cancelado');
INSERT INTO estados_spc(nombre) VALUES('Cerrado');


CREATE TABLE solicitud_pedido_cliente(
    id_spc uuid DEFAULT uuid_generate_v4(),
    id_cliente VARCHAR(10) NOT NULL,
    id_producto uuid,
    id_estado INT NOT NULL,
    presupuesto_min INT,
    presupuesto_max INT,
    comentario VARCHAR(100),
    fecha_reserva timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id_spc),
    FOREIGN KEY(id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY(id_producto) REFERENCES productos(id_producto),
    FOREIGN KEY(id_estado) REFERENCES estados_spc(id_estado)
);


CREATE TABLE roles_usuarios(
    id_rol SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_rol)
);

INSERT INTO roles_usuarios(nombre) 
VALUES
('Administrador'),
('Tienda');

CREATE TABLE usuarios(
    id_usuario SERIAL UNIQUE,
    id_rol_usuario INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    correo VARCHAR(50) NOT NULL,
    contrasena VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_usuario),
    FOREIGN KEY(id_rol_usuario) REFERENCES roles_usuarios(id_rol)
);

INSERT INTO usuarios (
    id_rol_usuario,
    nombre,
    correo,
    contrasena
)
VALUES
    (  
        (SELECT id_rol FROM roles_usuarios WHERE nombre = 'Administrador'),
        'Administrador',
        'admin@grylan.cl',
        'admin'
    ),
    (
        (SELECT id_rol FROM roles_usuarios WHERE nombre = 'Tienda'),
        'BeCycling Padre Hurtado',
        'becyclingpadrehurtado@grylan.cl',
        '861212'
    );