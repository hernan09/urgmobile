import { Injectable } from '@angular/core'
import { AlertController, ToastController, LoadingController } from 'ionic-angular'
import { Subject } from 'rxjs/Subject'

import { Config } from '../app/config'


@Injectable()
export class Utils {

  alert :any
  toast :any
  loading :any

	firstTimeNotificationsSent :boolean = true

	notificationsCounter :any
	notificationsCounterChange :Subject<number> = new Subject<number>()

  constructor(
    public alertCtrl :AlertController,
    public toastCtrl :ToastController,
    public loadingCtrl :LoadingController
  ){
  	this.notificationsCounter = 0
  }

  public showAlert(title, subTitle) {
    this.alert = this.alertCtrl.create({
      title,
      subTitle,
      buttons: ['OK']
    })

    this.alert.present()
  }

  public showOptionAlert(title,message, opcionOk, opcionCancel){
    let alert = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
            {
                text: opcionCancel,
                handler: () => {
                    alert.dismiss(false);
                    return false;
                }
            },
            {
                text: opcionOk,
                handler: () => {
                    alert.dismiss(true);
                    return true;
                }
            }
        ]
    });

    return alert;
}

  public hideAlert() {
    if (this.alert) this.alert.dismiss().catch(e=>{})
  }


  public showToast(message='Hola. Soy una tostadita :3', duration?, position?) {
    this.toast = this.toastCtrl.create({
      message,
      duration,
      position,
      showCloseButton : duration === 0,
      closeButtonText : 'Cerrar',
    })

    this.toast.present()
  }
  public hideToast() {
    if (this.toast) this.toast.dismiss().catch(e=>{})
  }


  public showLoader() {
    this.loading = this.loadingCtrl.create({
      spinner : 'crescent',
      content : 'Por favor espere...',
      dismissOnPageChange : false,
    })

    this.loading.present()
  }
  public hideLoader() {
    if (this.loading) this.loading.dismiss().catch(e=>{})
  }


  public getItem(name) {
    return JSON.parse(window.localStorage.getItem(name))
  }
  public setItem(name, obj) {
    if (!name) return
    window.localStorage.setItem(name, JSON.stringify(obj))
  }
  public delItem(name) {
    if (!name) return
    window.localStorage.removeItem(name)
  }


  public getActiveUser() {
    return this.getItem(Config.KEY.ACTIVE)
  }
  public setActiveUser(dni) {
    this.setItem(Config.KEY.ACTIVE, dni)
    console.log('Active user is now [%s]', dni)
  }


  public getTitular() {
    return this.getItem(Config.KEY.TITULAR)
  }
  public setTitular(dni) {
    if (!dni) return
    this.setItem(Config.KEY.TITULAR, dni)
  }


  public increaseNotificationsCounter() {
    this.notificationsCounter++
    this.notificationsCounterChange.next(this.notificationsCounter)
  }
  public decreaseNotificationsCounter() {
    this.notificationsCounter--
    this.notificationsCounterChange.next(this.notificationsCounter)
  }


  public isTrue(value) {
    return typeof value === 'string'
      ? this.stringToBoolean(value)
      : value
  }

  public stringToBoolean(string) {
    switch(string.toLowerCase().trim()) {
      case "false": case "no": case "0": case "": return false;
      default: return true;
    }
  }
}


export const DUMMY_NOTIS = [{
  title: 'Nueva Solicitud',
  data: {
    tipoAtencion: "1",
    idAtencion: "10000001",
    dni: "22095614",
    contenido: "Tenés 1 solicitud pendiente de asignación",
    fecha: "12/12/2017",
    hora: "16:25",
    idOrigen: "1234",
    identificacionMedico: "1234",
    titulo: "1234"
  }
},{
  title: 'Alerta de Prearribo',
  data: {
    tipoAtencion: "2",
    idAtencion: "10000001",
    dni: "22095614",
    contenido: 'Tomese una aspirina y espere sentado',
    fecha: "12/12/2017",
    hora: "16:25",
    idOrigen: "1234",
    identificacionMedico: "1234",
    titulo: "1234"
  }
},{
  title: 'Doctor en camino',
  data: {
    tipoAtencion: "3",
    idAtencion: "10000001",
    dni: "22095614",
    contenido: "1234",
    fecha: "12/12/2017",
    hora: "17:25",
    idOrigen: "1234",
    identificacionMedico: "1234",
    titulo: "1234"
  }
},{
  title: 'Doctor en camino - Demora',
  data: {
    tipoAtencion: "4",
    idAtencion: "10000001",
    dni: "22095614",
    contenido: "1234",
    fecha: "12/12/2017",
    hora: "17:25",
    idOrigen: "1234",
    identificacionMedico: "1234",
    titulo: "1234"
  }
},{
  title: 'Doctor está en el hogar',
  data: {
    tipoAtencion: "5",
    idAtencion: "10000001",
    dni: "22095614",
    contenido: "1234",
    fecha: "12/12/2017",
    hora: "17:25",
    idOrigen: "1234",
    identificacionMedico: "1234",
    titulo: "1234"
  }
}
,{
  data: {
    preguntas : [
      'Cómo fue la atención?',
      'Cuánto te gustó el/la médico/a?',
    ]
  }
}
]
