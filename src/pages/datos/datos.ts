import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'

import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'

@Component({
  selector : 'page-datos',
  templateUrl : 'datos.html',
})
export class DatosPage {

	@ViewChild(Content)
	content: Content;
	showSubHeader = true
	scrollTopStart

	persona :any = {
		dni: '',
		// antecedentes: [],
		datosCredencial: {},
		datosPersonales: []
	}

	telefono

	constructor (
		private ref :ChangeDetectorRef,
		public navCtrl :NavController,
		public navParams :NavParams, 
		public dataService :DataService,
		public utils :Utils
	){		
		this.fullPersonData();
		this.telefono = dataService.getPhoneNumber();		
		dataService.getDatosSocio().subscribe(this.handleData.bind(this), this.handleError.bind(this));
	}

	handleData(data) {
		if (data.length) data = data[0]
		//console.log('Mis Datos:', data)
		this.persona = data
		this.persona.datosCredencial = data.datosCredencial[0] // FIX por error del backend
		this.persona.dni = this.utils.getActiveUser()
		this.dataService.updateUsers()
		this.utils.hideLoader();
	}

	handleError(err) {
		this.handleData(this.dataService.restoreMisDatos());
		this.utils.hideLoader();
	}

	ionViewDidLoad() {
		this.content.ionScrollStart.subscribe((data)=>{
			this.scrollTopStart = data.scrollTop
		})
		this.content.ionScrollEnd.subscribe((data)=>{
			let scrollDiff = data.scrollTop - this.scrollTopStart
			if (scrollDiff > 20) {
				this.showSubHeader = false
			    this.ref.detectChanges()
			    this.scrollTopStart = data.scrollTop
			}
			else if (scrollDiff < -20) {
				this.showSubHeader = true
			    this.ref.detectChanges()
			    this.scrollTopStart = data.scrollTop
			}
		})
		this.content.ionScroll.subscribe((data)=>{
			let scrollDiff = data.scrollTop - this.scrollTopStart
			if (scrollDiff > 20) {
				this.showSubHeader = false
			    this.ref.detectChanges()
			    this.scrollTopStart = data.scrollTop
			}
			else if (scrollDiff < -20) {
				this.showSubHeader = true
			    this.ref.detectChanges()
			    this.scrollTopStart = data.scrollTop
			}
		})
	}

	fullPersonData(){
		let data = this.dataService.restoreMisDatos(this.utils.getActiveUser())
		if(data){
			this.persona = data
		this.persona.datosCredencial = data.datosCredencial[0] // FIX por error del backend
		this.persona.dni = this.utils.getActiveUser()
		this.dataService.updateUsers();		
		}
		else{
			this.utils.showLoader();
		}
		
	}

	nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber()
	}

}
