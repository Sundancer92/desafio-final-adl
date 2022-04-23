CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE marcas(
    id_marca SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_marca)
);

INSERT INTO marcas(nombre) VALUES('CUBE');
INSERT INTO marcas(nombre) VALUES('Giant');
INSERT INTO marcas(nombre) VALUES('Scott');
INSERT INTO marcas(nombre) VALUES('Liv');
INSERT INTO marcas(nombre) VALUES('Syncross');
INSERT INTO marcas(nombre) VALUES('Kilpi');
INSERT INTO marcas(nombre) VALUES('ACID');
INSERT INTO marcas(nombre) VALUES('RFR');

CREATE TABLE usuarios(
    id_usuario SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    PRIMARY KEY(id_usuario)
);

INSERT INTO usuarios(nombre, apellido, email, password, tipo) VALUES('Admin', 'Admin', 'admin@admin.cl', 'admin123', 'admin');

CREATE TABLE clientes(
    id_cliente uuid DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_cliente)
);

INSERT INTO clientes(nombre, apellido, email) VALUES('Cliente', 'Gimenez', 'cliente.gimenez@gmail.com');

CREATE TABLE productos(
    id_producto SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    id_marca INTEGER NOT NULL,
    talla VARCHAR(50) NOT NULL,
    disciplina VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_producto),
    FOREIGN KEY(id_marca) REFERENCES marcas(id_marca)
);


INSERT INTO productos(nombre, id_marca, talla, disciplina) VALUES('Stereo Pro 120', (SELECT id_marca FROM marcas WHERE nombre = 'CUBE'), 'M', 'Ciclismo');


CREATE TABLE reservas(
    id_reserva uuid DEFAULT uuid_generate_v4(),
    id_cliente uuid NOT NULL,
    id_producto INT,
    presupuesto INT,
    estado VARCHAR(50) NOT NULL,
    comentario VARCHAR(50),
    fecha_reserva timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id_reserva),
    FOREIGN KEY(id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY(id_producto) REFERENCES productos(id_producto)
);

INSERT INTO reservas(
    id_cliente,
    id_producto,
    presupuesto,
    estado,
    comentario
) VALUES(
    (SELECT id_cliente FROM clientes WHERE nombre = 'Cliente'),
    (SELECT id_producto FROM productos WHERE nombre = 'Stereo Pro 120'),
    1000000,
    'Pendiente',
    'Sin comentarios'
);
