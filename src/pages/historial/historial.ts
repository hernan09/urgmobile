import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'

import { HistorialDetallePage } from '../historial-detalle/historial-detalle'

import { Config } from '../../app/config'
import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'

@Component({
  selector: 'page-historial',
  templateUrl: 'historial.html',
})

export class HistorialPage {

	@ViewChild(Content)	content :Content
	showSubHeader = true
	scrollTopStart

	historial

	telefono

	constructor (
		private ref :ChangeDetectorRef,
		public navCtrl :NavController,
		public navParams :NavParams,
		public dataService :DataService,
		public utils :Utils
	) {
		this.telefono = dataService.getPhoneNumber()
		this.utils.showLoader()
		dataService.getHistorial().subscribe(this.handleData.bind(this), this.handleError.bind(this))
	}

	handleData(data) {
		console.log('Historial:', data)
		if (data && data.length) this.historial = this.formatData(data)
		else this.utils.showAlert('Lo sentimos', Config.MSG.HISTORIAL_EMPTY)
		this.utils.hideLoader()
	}

	handleError(err) {
		this.handleData(this.dataService.restoreHistorial())
	}

	formatData(data){
		return data.map(el => {
			let fecha = el.fecha.split('T')[0]
			fecha = fecha.substring(8, 10) + '-' + fecha.substring(5, 7) + '-' + fecha.substring(0, 4)
			return {...el, fecha}
		})
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

	goToDetail(visita) {
		this.navCtrl.push(HistorialDetallePage, { visita })
	}

	nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber()
	}

}
