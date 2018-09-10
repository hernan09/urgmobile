import { Component } from '@angular/core'
import { NavController, NavParams } from 'ionic-angular'

import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'


@Component({
  selector: 'page-credencial',
  templateUrl: 'credencial.html',
})
export class CredencialPage {

	public  persona = {
		nombre:'',
		apellido:'',
		dni: '',
		datosCredencial: {},
		datosPersonales: []
	}

	public telefono

	constructor (
		public navCtrl :NavController,
		public navParams :NavParams, 
		public data :DataService,
		public utils :Utils
	) {
		//Busca en localstorage datos credencial
		this.fullCredentialData();
		
		
		//Busca en localstorage phone numbers
		this.telefono = data.getPhoneNumber();

		const dni = this.utils.getActiveUser()
		
		//Busca en BK datos socio
		data.getDatosSocio(dni).subscribe(
			data => {
				this.persona = data
				this.persona.datosCredencial = data.datosCredencial[0] // FIX por error del backend
				this.persona.dni = dni
				this.data.updateUsers();
				this.utils.hideLoader();
			}
		)
	}

	fullCredentialData(){
		let credentialData = this.data.restoreMisDatos(this.utils.getActiveUser())
		if(credentialData){
		this.persona = credentialData
		this.persona.datosCredencial = credentialData.datosCredencial[0] // FIX por error del backend
		this.persona.dni = credentialData.dni;		
		}
		else{
			this.utils.showLoader(false);
		}
		
	}


}