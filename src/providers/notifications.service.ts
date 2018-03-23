import { Injectable } from '@angular/core'
import 'rxjs/Rx'
import 'rxjs/add/operator/map'
import { Subject } from 'rxjs/Subject'

import { OneSignal } from '@ionic-native/onesignal'

import { VideoConsultaPage } from '../pages/videoconsulta/videoconsulta'

import { DataService } from './data.service'
import { Utils, DUMMY_NOTIS } from './utils'
import { Config } from '../app/config'


const SIM_DELAY :number = Config.OPTIONS.NOTI_SIM_DELAY

const ALERTA :any = {
	title: 'Inicio',
	step: 0,
	asignacion: null,
	prearribo: {},
	estado: null,
	doctor: {
		nombre: '',
		matricula: null,
		especialidad: '',
	},
	poll: {
		question: '',
		rate: 0,
		label: '',
		comment: '',
		thanks: false,
	}
}


@Injectable()
export class NotificationsService {

	alertasEmpty :Array<any> = [ ALERTA ]

	alertas :Array<any> = this.dataService.restoreAlertas() || this.alertasEmpty.concat()

	alertasChange :Subject<any> = new Subject<any>()


	constructor(
    private oneSignal :OneSignal,
    private dataService :DataService,
    public utils :Utils
  ){

		if (SIM_DELAY) {
			console.info('Simulando notificaciones...')
			const simulation = setInterval(()=>{
				DUMMY_NOTIS.length
					? this.newNotification(DUMMY_NOTIS.shift())
					: clearInterval(simulation)
			}, SIM_DELAY * 1000)
		}
		
	}


	init(navCtrl) {

		this.oneSignal.startInit(
	      //Config.OPTIONS.ONE_SIGNAL_APP_ID,
		  //Config.OPTIONS.GOOGLE_PROJECT_NUMBER
		  Config.OPTIONS.ONE_SIGNAL_APP_ID_TEST,
	      Config.OPTIONS.GOOGLE_PROJECT_NUMBER_TEST
	    )

	    this.oneSignal.handleNotificationReceived().subscribe(notification => {
	      // TODO: VALIDACIÓN DE DNI
	      const noti = {
	        title: notification.payload.body,
	        data: notification.payload.additionalData
	      }
	      console.log('Notification Received:', noti)
	      this.newNotification(noti)
	    })

	    this.oneSignal.handleNotificationOpened().subscribe(data => {
	      // TODO: VALIDACIÓN DE DNI
	      const noti = {
	        title: data.notification.payload.body,
	        data: data.notification.payload.additionalData
	      }
	      console.log('Notification Opened')
	      const isVideoConsulta = noti.data.tipoAtencion == '1'
	        && noti.data.contenido.indexOf('#') != -1
	      if (isVideoConsulta) {
	        const cid = noti.data.contenido.split('#')[1]
	        navCtrl.setRoot(VideoConsultaPage, { cid, dni : noti.data.dni })
	      }
	    })

	    this.oneSignal.endInit()

	    console.log('Initialized notification handlers')

	    return this.oneSignal.getIds()
	}


	getAlertas() {
		return this.alertas
	}


	setAlertas(alertas) {
		this.alertas = alertas
		this.saveAlertas()
	}

	popAlerta() {
		console.log('Alertas:', this.alertas)
		this.alertas.length < 2
		  ? this.alertas = this.alertasEmpty.concat()
		  : this.alertas.pop()
		this.saveAlertas()
		this.alertasChange.next(this.alertas)
	}


	private newNotification(notification) {
		this.updateAlertas(notification)
		//console.log('Updated alertas:', this.alertas)
		this.alertasChange.next(this.alertas)
	}


	private updateAlertas(notification) {
		if (!notification) return
		//console.log('Updating alertas:', notification)
		let alerta = Object.assign({}, ALERTA)

		if (notification.data.preguntas && notification.data.preguntas.length) {
			alerta.step = 4
			alerta.title = 'Encuesta de satisfacción'
			alerta.poll.question = notification.data.preguntas[0]
			this.alertas = [ alerta ]
		}
		else {
			alerta.title = notification.title
			switch (notification.data.tipoAtencion) {

			case "1":
				alerta.step = 1
				alerta.asignacion = notification.data.contenido
				break

			case "2":
				alerta.step = 2
				alerta.prearribo.consejos = [ notification.data.contenido ]
				break

			case "3":
				this.removeStep(3)
				alerta.step = 3
				alerta.estado = {
					status: 'El médico está en camino',
					label: 'Horario estimado de arribo',
					hora: notification.data.hora,
					ok: true
				}
				break

			case "4":
				this.removeStep(3)
				alerta.step = 3
				alerta.estado = {
					status: 'El médico está demorado',
					label: 'Nuevo horario de arribo',
					hora: notification.data.hora,
					ok: false
				}
				break

			case "5":
				this.removeStep(3)
				alerta.step = 3
				alerta.estado = {
					status: 'El médico arribó al domicilio',
					label: 'Horario estimado de arribo',
					hora: notification.data.hora,
					ok: true
				}
				break;

			}

			this.alertas.unshift(alerta)
		}

		this.saveAlertas()
	}


	private saveAlertas() {
		this.dataService.saveAlertas(this.alertas)
	}


	private removeStep(step) {
		let i = this.alertas.findIndex(e => e.step === step)
		if (i != -1) this.alertas.splice(i, 1)
	}

}
