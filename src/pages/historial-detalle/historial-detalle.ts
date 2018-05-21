import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'
import { DataService } from '../../providers/data.service';

@Component({
  selector: 'page-historial-detalle',
  templateUrl: 'historial-detalle.html',
})

export class HistorialDetallePage {

	@ViewChild(Content)
	content: Content;
	showSubHeader = true
	scrollTopStart

	visita
	telefono

	constructor (
		private ref :ChangeDetectorRef,
		public navCtrl: NavController,
		public navParams: NavParams,
		public dataService: DataService
	) {
		this.telefono = dataService.getPhoneNumber();
		this.visita = this.navParams.get('visita')
		console.log(this.visita.detalles[0].detalle)
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

	nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber();
	}

}
