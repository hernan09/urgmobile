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

	@ViewChild(Content)
	content: Content;
	showSubHeader = true
	scrollTopStart

	alertas :any
	telefono :string
	videoconsulta = false
	answered = false
	cid=''
	dni=''
	
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
		private utils :Utils
	){
		this.alertas = notiService.getAlertas()
		this.telefono = dataService.getPhoneNumber()
		this.videoconsulta = !!utils.getItem('cid')
		this.cid = navParams.get('cid') || utils.getItem('cid') || 'test'
		this.dni = navParams.get('dni') || utils.getItem('dni') || '12345678'
		
		//this.initStars()

		notiService.alertasChange.subscribe(alertas => {
			this.alertas = alertas
			//console.log('Change detected in alertas:', this.alertas)
			if (!this.ref['destroyed']) this.ref.detectChanges()
		})

		setTimeout(_ => {
			this.updateDatos()
		}, 500)

	}


	updateDatos() {
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


	ionViewWillEnter() {
		this.alertas = this.notiService.getAlertas()
		//console.log('Alertas:', this.alertas)
		this.ref.detectChanges()
	}


	rate(rating) {
		const poll = this.alertas.slice(-1)[0].poll
		poll.rate = rating
		//poll.label = RATING_LABELS[rating]
		//this.stars = this.stars.map((el, i) => i < rating ? 'star' : 'star-outline')
		this.ref.detectChanges()
	}

	sendPoll() {
		this.utils.showLoader()
		const { question, rate, comment } = this.alertas.slice(-1)[0].poll
		const data = {
			dni : this.utils.getActiveUser(),
			question,
			rate,
			comment,
			answerDate : new Date(),
		}
		this.dataService.responderEncuesta(data).subscribe(
			data => {
				this.sayThanks()
			},
			err => {
				this.sayThanks()
			})
		this.answered = true
	}


	sayThanks() {
		this.utils.hideLoader()
		this.alertas.slice(-1)[0].poll.thanks = true
		this.ref.detectChanges()
		setTimeout(_ => this.closePoll(), 10 * 1000)
	}


	closePoll() {
		const poll = this.alertas.slice(-1)[0].poll
		poll.rate = 0
		poll.comment = ''
		poll.thanks = false
		this.answered = false
		//this.initStars()
		this.notiService.popAlerta()
		this.ref.detectChanges()
	}

	/*
	initStars() {
		this.stars = Array(Object.keys(RATING_LABELS).length).fill('star-outline')
	}
	*/

	nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber()
	}


	initVideoconsulta(cid,dni) {
		this.navCtrl.setRoot(VideoConsultaPage, { cid, dni })
	}

}
