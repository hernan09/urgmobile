import { VideoConsultaService } from './../../providers/video.consulta.service';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'

import { NotificationsService } from '../../providers/notifications.service'
import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'

import { VideoConsultaPage } from '../videoconsulta/videoconsulta'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

	@ViewChild(Content) content: Content;
	showSubHeader = true
	showHomeIcon:boolean
	scrollTopStart

	alertas :any
	telefono :string
	videoconsulta = false
	answered = false
	cid=''
	dni=''
	isCIDBlocked = false;

	poll_options = [
		{ value : 3, class : 'good', label : '¡MUY BUENA!' },
		{ value : 2, class : 'meh', label : 'REGULAR' },
		{ value : 1, class : 'bad', label : 'MALA' },
	]

	constructor (
		private ref :ChangeDetectorRef,
		private navCtrl :NavController,
		private navParams :NavParams,
		private notiService :NotificationsService,
		private dataService :DataService,
		private utils :Utils,
		private videoConsultaService : VideoConsultaService,		
	){
		this.alertas = notiService.getAlertas().filter(alerta => alerta.visible == true)
		this.alertas.length > 0 ? this.showHomeIcon = false : this.showHomeIcon = true

		//this.telefono = dataService.getPhoneNumber()
		this.videoconsulta = !!utils.getItem('cid')
		this.cid = navParams.get('cid') || utils.getItem('cid') || 'test'
		this.dni = navParams.get('dni') || utils.getItem('dni') || this.utils.getActiveUser();		

		notiService.alertasChange.subscribe(alertas => {
			console.log("Recibo alertas actualizadas");
			this.alertas = alertas.filter(alerta => alerta.visible == true)
			this.alertas.length > 0 ? this.showHomeIcon = false : this.showHomeIcon = true
			if (!this.ref['destroyed']) this.ref.detectChanges()
		})		
		this.alertas = notiService.getCurrentAlertas();

		setTimeout(_ => {			
			this.updateDatos();
		}, 500);
	}


	updateDatos() {
		this.videoConsultaService.checkIfBlocked(this.dni).subscribe(data =>{
			this.isCIDBlocked = data;
			this.renderPage();
		})
	}

	renderPage(){
		//Si es videoconsulta no llamo al servicio de actualizar datos
		if(this.videoconsulta){
			this.initVideoconsulta(this.cid,this.dni);
		}
		else{
			this.dataService.getDatosSocio().subscribe(
				data => {
					this.dataService.updateUsers()
					this.updateTelefono()
				},
				err => {
					this.dataService.updateUsers()
					this.updateTelefono()
				}
			)
		}
	}


	updateTelefono() {

		console.log("updateTelefono hace lo mismo en Ok que error???")
		this.dataService.getTelefonos().subscribe(
			data => {
				this.telefono = this.dataService.getPhoneNumber()
			},
			err => {
				this.telefono = this.dataService.getPhoneNumber()
			}
		)
	}


	ionViewDidLoad() {
		this.content.ionScrollStart.subscribe((data)=>{
			if(data) this.scrollTopStart = data.scrollTop;
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

	rate(rating) {
		const poll = this.alertas.slice(-1)[0].poll
		poll.rate = rating
		this.ref.detectChanges()
	}

	
	sendPoll() {
		this.utils.showLoader()
		const { question, rate, comment, idAttention } = this.alertas.slice(-1)[0].poll
		const data = {
			dni : this.utils.getActiveUser(),
			question,
			rate,
			comment,
			answerDate : new Date(),
			idAttention
		}
		this.dataService.responderEncuesta(data).subscribe(
			data => {
				this.sayThanks()
			},
			err => {
				this.sayThanks()
			})
		this.answered = true

		data.rate = 0;
		data.comment = "";
	}


	sayThanks() {
		this.utils.hideLoader()
		this.alertas[0].poll.thanks = true
		this.ref.detectChanges()
        setTimeout(_ => {

			this.notiService.hideNotifications();
			this.showHomeIcon = true;
			
			const poll = this.alertas.slice(-1)[0].poll
			poll.rate = 0
			poll.comment = ''
			this.ref.detectChanges()
		}, 3000)

		this.content.scrollToTop(1000);
	}


	closePoll() {
		const poll = this.alertas.slice(-1)[0].poll
		poll.rate = 0
		poll.comment = ''
		poll.thanks = false
		this.answered = false
		this.ref.detectChanges()
	}

	nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber()
	}


	initVideoconsulta(cid,dni) {
		this.navCtrl.setRoot(VideoConsultaPage, { cid, dni })
	}
}
