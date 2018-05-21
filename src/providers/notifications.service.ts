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
import { LoginPage } from '../pages/login/login';


const SIM_DELAY: number = Config.OPTIONS.NOTI_SIM_DELAY


const ALERTA: any = {
    title: 'Inicio',
    step: 0,
    asignacion: null,
    prearribo: {},
    estado: null,
    visible: true,
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

    private  doneVC :boolean;

    alertasEmpty: Array<any> = []

    alertas: Array<any> = this.dataService.restoreAlertas() || this.alertasEmpty.concat()

    alertasChange: Subject<any> = new Subject<any>()

    constructor(
        private oneSignal: OneSignal,
        private dataService: DataService,
        private utils: Utils

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

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        this.oneSignal.handleNotificationReceived().subscribe(notification => {
            // TODO: VALIDACIÓN DE DNI
            const noti = {
                title: notification.payload.body,
                data: notification.payload.additionalData,
                androidNotificationId: notification.payload.notificationID
            }
            console.log('Notification Received:', noti);
            this.newNotification(noti);

            const isVideoConsulta = noti.data.tipoAtencion == '6'
            if (isVideoConsulta) {
                this.openVideoCall(navCtrl,noti);
            }
        })


        this.oneSignal.handleNotificationOpened().subscribe(data => {
            console.log('Notification Opened:');
            if(data.notification.groupedNotifications){
                data.notification.groupedNotifications.forEach( newNoti => {
                    //Si las notificaciones vienen agrupadas la info esta en cada newNoti
                    const noti = {
                        title: newNoti.body,
                        data: newNoti.additionalData,
                        androidNotificationId: newNoti.notificationID
                    }
                    this.manageNotification(navCtrl,noti);
                });
            }else{
                 //Si las notificaciones vienen de a una la info esta enel payload
                const noti = {
                    title: data.notification.payload.body,
                    data: data.notification.payload.additionalData,
                    androidNotificationId: data.notification.payload.notificationID
                }
                this.manageNotification(navCtrl,noti);
            }
        })

        this.oneSignal.endInit()
        return this.oneSignal.getIds()
    }


    private manageNotification(navCtrl,noti){

        //Validamos que la notificación fué recibida mientras la aplicación no estaba en 1er plano
        if (!this.wasAlertDisplayed(noti)) {
            console.log('Agregando alerta en open: ' + noti.androidNotificationId);
            this.newNotification(noti)

            const isVideoConsulta = noti.data.tipoAtencion == '6'
            if (isVideoConsulta) {
                this.openVideoCall(navCtrl,noti);
            }
        }

        //Si llega una notificación y hay un usuario activo redirecciona a Home sino a Login
        if(!this.utils.getActiveUser()){
            navCtrl.setRoot(LoginPage);
        }

    }


    private openVideoCall(navCtrl,noti:any){
        if (!this.doneVC && this.isVideoCall(noti.data.tipoAtencion)) {
            if(this.utils.getActiveUser()){
                console.log("Hay un usuario activo");
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
            } else {
                navCtrl.setRoot(LoginPage);
                console.log("No hay usuario activo, se envia al Login");
            }
        } else{
            console.log("Esta video call ya fue realizada" );
            this.doneVC = false;
        }
    }

    getAlertas() {
        return this.alertas = this.dataService.restoreAlertas() || this.alertasEmpty.concat()
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
        alerta.visible = true

        if (notification.data.preguntas && notification.data.preguntas.length) {
            alerta.step = 4
            alerta.androidNotificationId = notification.androidNotificationId
            alerta.title = 'Encuesta de satisfacción'
            alerta.poll.question = notification.data.preguntas[0]
            alerta.poll.thanks = false
            this.hideNotifications();
            this.alertas.unshift(alerta)

        }
        else{
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
                case "6":
                    this.removeStep(5)
                    alerta.step = 5
                    alerta.estado = {
                        status: 'Video Consulta Activa',
                        label: 'Tenés una Video Consulta en Curso',
                        hora: notification.data.hora,
                        cid:notification.data.contenido,
                        dni:notification.data.dni,
                        ok: true
                    }
                    break;
            }

            this.alertas.unshift(alerta)
        }

        this.saveAlertas(notification.data.dni)
    }

    private saveAlertas(dni?) {
        this.dataService.saveAlertas(this.alertas,dni)
    }

    private removeStep(step) {
        let i = this.alertas.findIndex(e => e.step === step)
        if (i != -1) this.alertas[i].visible = false;
    }

    private wasAlertDisplayed(noti) {
        let notId = noti.androidNotificationId;
        let alertaAnt = this.alertas.find(x => x.androidNotificationId == notId);

        if (alertaAnt) {
            return true;
        }
        return false;
    }

    private isVideoCall(tipoAlerta:String){
        return tipoAlerta=='6';
    }

    public hideNotifications(){

        this.alertas.forEach((item, index) => {
            console.log(item);
            console.log(index);

            this.alertas[index].visible = false;
        });

        if(this.alertas.length > 35){
            this.alertas.splice(20,16);
        }
        this.saveAlertas()

    }

}
