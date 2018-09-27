import { SociosPage } from './../socios/socios';
import { Config } from './../../app/config';
import { AlertService } from './../../providers/alert.service';
import { VideoConsultaService } from './../../providers/video.consulta.service';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'

import { NotificationsService } from '../../providers/notifications.service'
import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'

import { VideoConsultaPage } from '../videoconsulta/videoconsulta'
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

	@ViewChild(Content) content: Content;
	showSubHeader = true
	showHomeIcon:boolean
	scrollTopStart

	alertas_home :any
	telefono :string
	videoconsulta = false
	answered = false
	cid=''
	dni=''	
	isCIDBlocked : boolean;

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
		private alertService : AlertService,
		private events : Events,		
	){
		//Actualizo los datos de todos los usuarios, refresca el menu de multiusuario.
		this.dataService.updateUsers();	
		this.checkVCStatus();		
		
		this.alertas_home = notiService.getAlertas().filter(alerta => alerta.visible == true)
		this.alertas_home.length > 0 ? this.showHomeIcon = false : this.showHomeIcon = true

		this.videoconsulta = !!utils.getItem('cid')
		this.cid = navParams.get('cid') || utils.getItem('cid') || 'test'
		this.dni = navParams.get('dni') || utils.getItem('dni') || this.utils.getActiveUser();
			

		notiService.alertasChange.subscribe(alertas => {
			console.log("Recibo alertas actualizadas");
			this.alertas_home = alertas.filter(alerta => alerta.visible == true)
			this.alertas_home.length > 0 ? this.showHomeIcon = false : this.showHomeIcon = true			
			if (!this.ref['destroyed']) this.ref.detectChanges()						
		})
		
		events.subscribe('vcStatus', (data) => {
			this.isCIDBlocked = data;			
		  });
		
		 
		setTimeout(_ => {
			this.checkIfVCBlocked();
		}, 1000)
		this.updateUserData();
		
}

	checkIfVCBlocked() {
		this.videoConsultaService.checkIfBlocked(this.dni, this.cid)
		.filter(data => data === true).subscribe(
            data =>{
				console.log("data === true : la VC FINALIZO!!!!");
				this.isCIDBlocked = data;
			})
			err =>{
				console.log("data === false : COMO QUE LA  VC NO FINALIZO????");
			}
	}

	updateUserData(){
		//Si es videoconsulta no llamo al servicio de actualizar datos
		if(this.videoconsulta){
			this.initVideoconsulta(this.cid,this.dni);
		}
		else{
			let phonesLS = this.dataService.getLocalStorage(Config.KEY.TELEFONOS);
			let userDataLS = this.dataService.getLocalStorage(Config.KEY.MIS_DATOS);
			let historyLS = this.dataService.getLocalStorage(Config.KEY.HISTORIAL);
			if(!phonesLS){
				console.log("No hay telefonos en LS => los telefonos");
				this.dataService.updateTelefono();
				this.telefono = this.dataService.getPhoneNumber();
			} 
			if(!userDataLS){
				console.log("No hay usuarios en LS => traigo los Usuarios");

				this.dataService.getDatosSocio().subscribe(
					data => {this.dataService.updateUsers()},
					err => {console.log("Error al actualizar datos de Usuario y Telefono desde URG");
				})
			}
			if(!historyLS){
				console.log("No hay historial en LS => traigo el historial");
				this.dataService.getHistorial(this.dni).subscribe();

			}
		}
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

	ionViewDidEnter(){
		this.ref.detectChanges();
	}

	rate(rating) {
		const poll = this.alertas_home.slice(-1)[0].poll
		poll.rate = rating
		this.ref.detectChanges()
	}

	
	sendPoll() {
		this.utils.showLoader()
		const { question, rate, comment, idAttention } = this.alertas_home.slice(-1)[0].poll
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

	closeAlert(alerta){
		
		let alert = this.alertService.showOptionAlert(Config.TITLE.WARNING_TITLE, Config.MSG.ALERT_CLEANER, Config.ALERT_OPTIONS.ACEPTAR, Config.ALERT_OPTIONS.CANCELAR);	 		
		

		alert.onDidDismiss(res => {
			if (res != false) {			
				this.notiService.hideAlertById(alerta.androidNotificationId);
				this.notiService.alertasChange.next(this.alertas_home);		  
			} 
		  });
		  alert.present();
	}

	sayThanks() {
		this.utils.hideLoader()
		this.alertas_home[0].poll.thanks = true
		this.ref.detectChanges()
        setTimeout(_ => {

			this.notiService.hideNotifications();
			this.showHomeIcon = true;
			
			const poll = this.alertas_home.slice(-1)[0].poll
			poll.rate = 0
			poll.comment = ''
			this.ref.detectChanges()
		}, 3000)

		this.content.scrollToTop(1000);
		this.events.publish('survey', false);
	}

	//ver si es necesario
	ionViewWillLeave() {		
		this.checkVCStatus();
	}


	closePoll() {
		const poll = this.alertas_home.slice(-1)[0].poll
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

	checkVCStatus(){
		if(this.dataService.getVCStatus() == null){
			this.isCIDBlocked = false;
		}
		else{
			this.isCIDBlocked  = this.dataService.getVCStatus();
		}
	}

	goToSociosPage(){
		this.utils.showLoader();
		this.isVCAvailable();
	}

	private isVCAvailable(params?){
		this.dataService.validateAvailableVC(this.utils.getActiveUser()).subscribe(
		  res=>{
			  	this.utils.hideLoader();
				console.log("validateAvailableVC - res.estadoVC: ", res.estadoVC);
				if(res.estadoVC =="Inactivo"){
				  let message = res.Mensaje;
				  this.alertService.showAlert(Config.TITLE.WARNING_TITLE, message);
				  this.navCtrl.setRoot(HomePage, params);
				}else{
					this.navCtrl.push(SociosPage, params);
		  }},
		  err=>{
				this.utils.hideLoader();
				console.log('Erro al validateAvailableVC:', err);
				let message = Config.MSG.SOLICITUD_VC_ERROR;
				this.alertService.showAlert(Config.TITLE.WARNING_TITLE, message);
				this.navCtrl.setRoot(HomePage, params);
		  })
		}  
		
}
