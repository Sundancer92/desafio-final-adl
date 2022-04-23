
	const impimirReservas = (reserva) => {
        console.log("-------- FUNCION IMPRIMIR RESERVAS --------");
		let tablaReservas = document.getElementsByTagName('tbody')[0];
		tablaReservas.innerHTML = '';

		console.log(reserva[1]);

		for(let i = 0; i < reserva.lenght; i++){
			tablaReservas.innerHTML += `
			<tr>
				<th scope="row">${reserva[i].id}</th>
				<td>${reserva[i].producto}</td>
				<td>${reserva[i].nombre}</td>
				<td>${reserva[i].talla}</td>
				<td>${reserva[i].disciplina}</td>
				<td>${reserva[i].estado}</td>
			<tr
			`
		}
	}