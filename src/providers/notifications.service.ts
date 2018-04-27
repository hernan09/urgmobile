import { Injectable } from '@angular/core'
import 'rxjs/Rx'
import 'rxjs/add/operator/map'
import { Subject } from 'rxjs/Subject'

import { OneSignal } from '@ionic-native/onesignal'

import { VideoConsultaPage } from '../pages/videoconsulta/videoconsulta'
import { HomePage } from '../pages/home/home'

import { DataService } from './data.service'
import { Utils, DUMMY_NOTIS } from './utils'
import { Config } from '../app/config'


const SIM_DELAY: number = Config.OPTIONS.NOTI_SIM_DELAY

const ALERTA: any = {
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

    alertasEmpty: Array<any> = [ALERTA]

    alertas: Array<any> = this.dataService.restoreAlertas() || this.alertasEmpty.concat()

    alertasChange: Subject<any> = new Subject<any>()

    constructor(
        private oneSignal: OneSignal,
        private dataService: DataService,
        public utils: Utils
    ){
        if (SIM_DELAY) {
            console.info('Simulando notificaciones...')
            const simulation = setInterval(() => {
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

            //----- AMBIENTES DE DESA -----
            Config.OPTIONS.ONE_SIGNAL_APP_ID_TEST,
            Config.OPTIONS.GOOGLE_PROJECT_NUMBER_TEST
        )

        this.oneSignal.inFocusDisplaying(0);

        this.oneSignal.handleNotificationReceived().subscribe(notification => {
            // TODO: VALIDACIÓN DE DNI
            const noti = {
                title: notification.payload.body,
                data: notification.payload.additionalData,
                androidNotificationId: notification.androidNotificationId
            }
            console.log('Id Alerta recibido: ' + notification.androidNotificationId);
            console.log('Notification Received:', noti)
            this.newNotification(noti)

            const isVideoConsulta = noti.data.tipoAtencion == '6'
            if (isVideoConsulta) {

                let alert = this.utils.showVideoCallAlert();

                alert.onDidDismiss(res => {
                    console.log('Yes/No', res);
                    if(res != false){
                        const cid = noti.data.contenido
                        console.log('cid: ' + cid + ' noti.data.dni ' + noti.data.dni)
                        navCtrl.setRoot(VideoConsultaPage, { cid, dni: noti.data.dni })
                    }
                });

                alert.present();

            }
        })

        this.oneSignal.handleNotificationOpened().subscribe(data => {
            // TODO: VALIDACIÓN DE DNI
            console.log('Open noti: ' + data.notification.androidNotificationId);
            const noti = {
                title: data.notification.payload.body,
                data: data.notification.payload.additionalData,
                androidNotificationId: data.notification.androidNotificationId
            }
            //Validamos que la notificación fué recibida mientras la aplicación no estaba en 1er plano
            console.log('Antes de validar noti: ' + noti.androidNotificationId);
            if (!this.wasAlertDisplayed(noti)) {
                console.log('Agregando alerta en open: ' + noti.androidNotificationId);
                this.newNotification(noti)
            }

            const isVideoConsulta = noti.data.tipoAtencion == '6'
            if (isVideoConsulta) {

                if(this.utils.showVideoCallAlert()){
                    const cid = noti.data.contenido
                    console.log('cid: ' + cid + ' noti.data.dni ' + noti.data.dni)
                    navCtrl.setRoot(VideoConsultaPage, { cid, dni: noti.data.dni })
                }

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
        this.alertasChange.next(this.alertas)
    }


    private updateAlertas(notification) {
        if (!notification) return
        console.log('Updating alertas:', notification.androidNotificationId)
        let alerta = Object.assign({}, ALERTA)

        if (notification.data.preguntas && notification.data.preguntas.length) {
            alerta.step = 4
            alerta.title = 'Encuesta de satisfacción'
            alerta.poll.question = notification.data.preguntas[0]
            this.alertas = [alerta]
        }
        else {
            alerta.title = notification.title
            alerta.androidNotificationId = notification.androidNotificationId;
            switch (notification.data.tipoAtencion) {

                case "1":
                    alerta.step = 1
                    alerta.asignacion = notification.data.contenido
                    break

                case "2":
                    alerta.step = 2
                    alerta.prearribo.consejos = [notification.data.contenido]
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

    private wasAlertDisplayed(noti) {
        let notId = noti.androidNotificationId;
        let alertaAnt = this.alertas.find(x => x.androidNotificationId == notId);

        if (alertaAnt) {
            return true;
        }
        return false;
    }

}
