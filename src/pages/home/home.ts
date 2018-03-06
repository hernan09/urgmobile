import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'

import { NotificationsService } from '../../providers/notifications.service'
import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'

import { VideoConsultaPage } from '../videoconsulta/videoconsulta'


const RATING_LABELS = {
	1 : 'MALA',
	2 : 'REGULAR',
	3 : '¡MUY BUENA!',
}


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
	stars

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
		this.initStars()

		notiService.alertasChange.subscribe(alertas => {
			this.alertas = alertas
			//console.log('Change detected in alertas:', this.alertas)
			if (!this.ref['destroyed']) this.ref.detectChanges()
		})

		dataService.getTelefonos().subscribe(
			data => {
				this.telefono = dataService.getPhoneNumber()
			},
			err => {
				this.telefono = dataService.getPhoneNumber()
			}
		)

		dataService.getDatosSocio().subscribe(
			data => {
				dataService.updateUsers()
				this.ref.detectChanges()
			},
			err => {
				dataService.updateUsers()
				this.ref.detectChanges()
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
		const poll = this.alertas[0].poll
		poll.rate = rating
		poll.label = RATING_LABELS[rating]
		this.stars = this.stars.map((el, i) => i < rating ? 'star' : 'star-outline')
		this.ref.detectChanges()
	}


	closePoll() {
		const poll = this.alertas.slice(-1)[0].poll
		poll.rate = 0
		poll.comment = ''
		poll.thanks = false
		this.initStars()
		this.notiService.popAlerta()
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
	}


	sayThanks() {
		this.utils.hideLoader()
		this.alertas.slice(-1)[0].poll.thanks = true
		setTimeout(_ => this.closePoll(), 3 * 1000)
	}

	initStars() {
		this.stars = Array(Object.keys(RATING_LABELS).length).fill('star-outline')
	}


	nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber()
	}


	initVideoconsulta() {
		this.navCtrl.setRoot(VideoConsultaPage)
	}

}
