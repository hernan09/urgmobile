import { Component } from '@angular/core'
import { NavController, NavParams } from 'ionic-angular'

import { DataService } from '../../providers/data.service'

@Component({
	selector: 'page-familia',
	templateUrl: 'familia.html'
})

export class FamiliaPage {

	familia = [
		{
			apellido: 'Incarbone',
			nombre: 'Julio',
			imgSrc: '../assets/img/familia0.jpeg'
		}
	]

	telefono

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams, 
		public data: DataService
	) {
		this.telefono = data.getPhoneNumber()
	}

}
