import { Component } from '@angular/core'
import { NavController, NavParams } from 'ionic-angular'

import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'


@Component({
  selector: 'page-credencial',
  templateUrl: 'credencial.html',
})
export class CredencialPage {

	persona = {
		dni: '',
		// antecedentes: [],
		datosCredencial: {},
		datosPersonales: []
	}

	telefono

	constructor (
		public navCtrl :NavController,
		public navParams :NavParams, 
		public data :DataService,
		public utils :Utils
	) {
		this.telefono = data.getPhoneNumber();
		const dni = this.utils.getActiveUser()
		data.getDatosSocio(dni).subscribe(
			data => {
				this.persona = data
				this.persona.datosCredencial = data.datosCredencial[0] // FIX por error del backend
				this.persona.dni = dni
			}
		)
	}

	nextPhoneNumber() {
		this.telefono = this.data.nextPhoneNumber();
	}


}