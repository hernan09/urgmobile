import { Injectable } from '@angular/core'
import { AlertController, LoadingController } from 'ionic-angular'
import { Subject } from 'rxjs/Subject'

import { Config } from '../app/config'
import { Alert } from 'ionic-angular/components/alert/alert';


@Injectable()
export class Utils {

  alert :any  
  loading :any

	firstTimeNotificationsSent :boolean = true

	notificationsCounter :any
	notificationsCounterChange :Subject<number> = new Subject<number>()

  constructor(
    public alertCtrl :AlertController,    
    public loadingCtrl :LoadingController
  ){
  	this.notificationsCounter = 0
  }
  
  public showLoader(dismissOnPageChange?) {
    this.loading = this.loadingCtrl.create({
      spinner : 'crescent',
      content : 'Por favor espere...',
      dismissOnPageChange : dismissOnPageChange || true,
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

  public getCID() {
    return this.getItem(Config.KEY.CID)
  }
  public setCID(cid) {
    if (!cid) return
    this.setItem(Config.KEY.CID, cid)
  }

  public setAlert(anAlert:any) {
    if (!alert) return
    this.setItem(Config.KEY.ALERTAS, anAlert)
  }

  public getAlerts() {
    this.getItem(Config.KEY.ALERTAS)
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
