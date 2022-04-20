CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE marcas(
    id SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
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
    id SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO usuarios(nombre, apellido, email, password, tipo) VALUES('Admin', 'Admin', 'admin@admin.cl', 'admin123', 'admin');

CREATE TABLE clientes(
    id SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO clientes(nombre, apellido, email) VALUES('Cliente', 'Gimenez', 'cliente.gimenez@gmail.com');

CREATE TABLE productos(
    id SERIAL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    marca_id INTEGER NOT NULL,
    talla VARCHAR(50) NOT NULL,
    disciplina VARCHAR(50) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(marca_id) REFERENCES marcas(id)
);


INSERT INTO productos(nombre, marca_id, talla, disciplina) VALUES('Stereo Pro 120', (SELECT id FROM marcas WHERE nombre = 'CUBE'), 'M', 'Ciclismo');


CREATE TABLE reservas(
    id uuid DEFAULT uuid_generate_v4(),
    id_cliente INT,
    id_producto INT,
    presupuesto INT,
    estado VARCHAR(50) NOT NULL,
    comentario VARCHAR(50) NOT NULL,
    fecha_reserva timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(id_cliente) REFERENCES clientes(id),
    FOREIGN KEY(id_producto) REFERENCES productos(id)
);

INSERT INTO reservas(
    id_cliente,
    id_producto,
    presupuesto,
    estado,
    comentario
) VALUES(
    (SELECT id FROM clientes WHERE nombre = 'Cliente'),
    (SELECT id FROM productos WHERE nombre = 'Stereo Pro 120'),
    1000000,
    'Pendiente',
    'Sin comentarios'
);
