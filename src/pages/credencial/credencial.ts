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

	constructor (
		public navCtrl :NavController,
		public navParams :NavParams, 
		public data :DataService,
		public utils :Utils
	) {
		const dni = this.utils.getActiveUser()
		data.getDatosSocio(dni).subscribe(
			data => {
				this.persona = data
				this.persona.datosCredencial = data.datosCredencial[0] // FIX por error del backend
				this.persona.dni = dni
			}
		)
	}

}
