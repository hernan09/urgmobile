import { GroupedNotificationService } from './grouped.notificacion.service';
import { ImageService } from './image.service';
import { AlertService } from './alert.service';
import { ModalService } from './modal.service';
import { Config } from './../app/config';
import { Injectable } from "@angular/core";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Subject } from "rxjs/Subject";

import { OneSignal } from "@ionic-native/onesignal";

import { VideoConsultaPage } from "../pages/videoconsulta/videoconsulta";
import { HomePage } from "../pages/home/home";

import { DataService } from "./data.service";
import { Utils, DUMMY_NOTIS } from "./utils";
import { LoginPage } from "../pages/login/login";
import {Observable} from 'rxjs/Observable';
import { Events } from 'ionic-angular';

const SIM_DELAY: number = Config.OPTIONS.NOTI_SIM_DELAY;

const ALERTA: any = {
  title: "Inicio",
  alerta : "",
  step: 0,
  asignacion: null,
  prearribo: {},
  estado: null,
  visible: true,
  doctor: {
    nombre: "",
    matricula: null,
    especialidad: "",
    foto : "",
  },
  poll: {
    question: "",
    rate: 0,
    label: "",
    comment: "",
    thanks: false,
    idAttention:""
  }
};

@Injectable()
export class NotificationsService {
  private doneVC: boolean;

  alertasEmpty: Array<any> = [];

  alertas: Array<any> = this.dataService.restoreAlertas() ||
  this.alertasEmpty.concat();

  alertasChange: Subject<any> = new Subject<any>();

  

  constructor(
    private oneSignal: OneSignal,
    private dataService: DataService,
    private utils: Utils,
    private modalService : ModalService,
    private alertService : AlertService,
    private imageService : ImageService,
    private groupedNotificationService : GroupedNotificationService,
    private events : Events,
  ) {
    if (SIM_DELAY) {
      const simulation = setInterval(() => {
        DUMMY_NOTIS.length
          ? this.newNotification(DUMMY_NOTIS.shift())
          : clearInterval(simulation);
      }, SIM_DELAY * 1000);
    }
  }

  init(navCtrl) {
    this.oneSignal.startInit(
      Config.ONE_SIGNAL_ID_APP,
      Config.GOOGLE_PROJECT_NUMBER_APP
    );

    this.oneSignal.inFocusDisplaying(
      this.oneSignal.OSInFocusDisplayOption.Notification
    );

    this.oneSignal.handleNotificationReceived().subscribe(notification => {
      // TODO: VALIDACIÓN DE DNI
      const noti = {
        title: notification.payload.body,
        data: notification.payload.additionalData,
        androidNotificationId: notification.payload.notificationID
      };
      console.log("Notification Received:", noti);
      this.newNotification(noti);

      const isVideoConsulta = noti.data.tipoAtencion == "6";      
        if (isVideoConsulta) {
        this.modalService.closeAllOverlays(navCtrl);  
        this.openVideoCall(navCtrl, noti);
      }
    });

    this.oneSignal.handleNotificationOpened().subscribe(data => {
      console.log("Notification Opened:");
      if (data.notification.groupedNotifications) {
        this.groupedNotificationService.addGroupedNotifications(data.notification.groupedNotifications).subscribe(alertasArray =>{
          console.log("Lo que llega en el array: ", alertasArray);
          for (let index = 0; index < alertasArray.length; index++) { 
            let alertFilter = alertasArray.filter(alerta => alerta.order == index)  
            console.log("Alert Filter: " , alertFilter);                  
            this.addAlert(alertFilter[0]);
          }
            
        });
      
      } else {
        //Si las notificaciones vienen de a una la info esta en el payload
        const noti = {
          title: data.notification.payload.body,
          data: data.notification.payload.additionalData,
          androidNotificationId: data.notification.payload.notificationID
        };
        this.manageNotification(navCtrl, noti);//
      }
    });

    this.oneSignal.endInit();
    return this.oneSignal.getIds();
  }

  private manageNotification(navCtrl, noti) {
    //Validamos que la notificación fué recibida mientras la aplicación no estaba en 1er plano
    if (!this.groupedNotificationService.wasAlertDisplayed(noti)) {
        this.newNotification(noti);
        console.log(">>>> Se creo la nueva alerta");
        const isVideoConsulta = noti.data.tipoAtencion == "6";
        if (isVideoConsulta) {
          this.openVideoCall(navCtrl, noti);
      }
    }

    //Si llega una notificación y hay un usuario activo redirecciona a Home sino a Login
    if (!this.utils.getActiveUser()) {
      navCtrl.setRoot(LoginPage);
    }
  }

  private openVideoCall(navCtrl, noti: any) {
    this.dataService.setVCStatus(false);
    this.events.publish('vcStatus', false);
    if (!this.doneVC && this.isVideoCall(noti.data.tipoAtencion)) {
      //Hay un usuario activo
      if (this.utils.getActiveUser()) {
        let alert = this.alertService.showOptionAlert(Config.TITLE.VIDEO_CALL_TITLE,
          Config.MSG.VIDEO_CALL, Config.ALERT_OPTIONS.CONTESTAR, Config.ALERT_OPTIONS.IGNORAR
        );
        alert.onDidDismiss(res => {          
          const cid = noti.data.contenido;
          console.log("cid: " + cid + " noti.data.dni " + noti.data.dni);
          if (res != false) {            
            navCtrl.setRoot(VideoConsultaPage, { cid, dni: noti.data.dni });
          }else{
            navCtrl.setRoot(HomePage, { cid, dni: noti.data.dni });
          }
        });
        alert.present();
      } else {
        //No hay usuario activo, se envia al Login
        navCtrl.setRoot(LoginPage);
        
      }
    } else {
      //la video call ya fue realizada
      this.doneVC = false;
    }
  }
  getCurrentAlertas(){
    return this.alertas;
  }
  public getAlertas() {
    return (this.alertas =
      this.dataService.restoreAlertas() || this.alertasEmpty.concat());
  }

  setAlertas(alertas) {
    this.alertas = alertas;
    this.saveAlertas();
  }

  popAlerta() {
    this.alertas.length < 2
      ? (this.alertas = this.alertasEmpty.concat())
      : this.alertas.pop();
    this.saveAlertas();
    this.alertasChange.next(this.alertas);
  }

  private newNotification(notification) {
    this.updateAlertas(notification);
    this.alertasChange.next(this.alertas);
  }

 public addAlert(alerta){
  if(!alerta)
  return;

   if(alerta.step == 3){
     this.removeStep(3);
   }
   if(alerta.step == 6){
     this.hideNotifications();
   }
   if(alerta.setp == 5){
    this.removeStep(5);
   }
   console.log("Insertando alerta: ", alerta);
  this.alertas.unshift(alerta);
  this.saveAlertas();
  this.alertasChange.next(this.alertas);
 }

  /////////////////////////////////OLD
  private updateAlertas(notification) {
    if (!notification) return;
    console.log("Updating alertas:", notification.androidNotificationId);
    let alerta = JSON.parse(JSON.stringify(ALERTA));
    alerta.visible = true;

    if (notification.data.preguntas && notification.data.preguntas.length) {
      alerta.step = 4;
      alerta.androidNotificationId = notification.androidNotificationId;
      alerta.alerta = notification.data.alerta;
      alerta.title = "Encuesta de satisfacción";
      alerta.poll.question = notification.data.preguntas[0];
      alerta.poll.idAttention = notification.data.idAtencion;
      alerta.poll.thanks = false;
      alerta.visible = true;
      this.hideNotifications();
      console.log("Lista Alerta encuenta: " , this.alertas);

      this.alertas.unshift(alerta);
      this.events.publish('survey', true);
      this.saveAlertas();
    } else {
      alerta.title = notification.title;
      alerta.androidNotificationId = notification.androidNotificationId;
      alerta.alerta = notification.data.alerta;
      switch (notification.data.tipoAtencion) {
        case "1":
          alerta.step = 1;
          alerta.asignacion = notification.data.contenido;
          alerta.visible = true;
          console.log("Lista Alerta tipo 1: " , this.alertas);
          this.alertas.unshift(alerta);
          this.saveAlertas();
          break;

        case "2":
          alerta.step = 2;
          alerta.prearribo.consejos = [notification.data.contenido];
          alerta.visible = true;
          console.log("Lista Alerta tipo 2: " , this.alertas);
          this.alertas.unshift(alerta);
          this.saveAlertas();
          break;
        case "3":
          alerta = this.fillDoctorData(alerta,3,notification,notification.data.nombreMedico,notification.data.titulo,"Horario estimado de arribo",notification.data.hora,true); 
          break;
        case "4":
          alerta = this.fillDoctorData(alerta,3,notification,notification.data.nombreMedico,notification.data.titulo,"Nuevo horario de arribo",notification.data.hora,false);
          break;
        case "5":
          this.fillDoctorData(alerta,3,notification,notification.data.nombreMedico,notification.data.titulo,"Horario estimado de arribo",notification.data.hora,true);
          break;
        case "6":
          this.removeStep(5);
          alerta.step = 5;          
          alerta.estado = {
            status: "Video Consulta Activa",
            label: "Tenés una Video Consulta en Curso",
            hora: notification.data.hora,
            cid: notification.data.contenido,
            dni: notification.data.dni,
            ok: true
          };
          alerta.visible = true;
          this.alertas.unshift(alerta);
          this.saveAlertas();
          break;
      }
    }
  }
  ///////////////////////////////// END OLD

  private saveAlertas() {
    this.dataService.saveAlertas(this.alertas);
  }

  private removeStep(step) {
    let i = this.alertas.findIndex(e => e.step === step);
    if (i != -1) this.alertas[i].visible = false;
  }

  public hideAlertById(id) {
    let i = this.alertas.findIndex(alert => alert.androidNotificationId === id);
    if (i != -1) this.alertas[i].visible = false;
    this.saveAlertas();
  }

  private isVideoCall(tipoAlerta: String) {
    return tipoAlerta == "6";
  }

  public hideNotifications() {
    this.alertas.forEach((item, index) => {
      console.log(item);
      console.log(index);

      this.alertas[index].visible = false;
    });

    if (this.alertas.length > 35) {
      this.alertas.splice(20, 16);
    }
    this.saveAlertas();
  }

  private fillDoctorData(alerta,step,notification,nNombreMedico,alertaStatus,alertaLabel,alertaHora,alertaOk){
    alerta.estado = {
      status: alertaStatus,
      label: alertaLabel,
      hora: alertaHora,
      ok: alertaOk
    };
    alerta.doctor = {
      nombre:nNombreMedico,
      matricula: notification.data.matriculaMedico,
      especialidad: notification.data.especialidadMedico
    }
    alerta.step = step;
    alerta = this.getDoctoPhoto(alerta,notification);                   

  }

  private getDoctoPhoto(alerta,notification){

    if(notification.data.fotoMedico){
      this.imageService.downloadImage(notification.data.fotoMedico).subscribe(data =>{
        console.log("Alerta: ",alerta);
        if(data != null){
          alerta.doctor.foto = data;
        }
        else{
          alerta.doctor.foto = "";
        }        
        this.removeStep(3);
        alerta.visible = true;
        console.log("Lista Alerta tipo doctor " + notification.data.tipoAtencion + ": " , this.alertas);
        this.alertas.unshift(alerta);
        this.saveAlertas();
        this.alertasChange.next(this.alertas);
        return alerta;
      }, err => { console.error(err);
        return alerta;
      }
      )
    }
    else{
      this.removeStep(3);
      alerta.doctor.foto = "";
      alerta.visible = true;
      console.log("Lista Alerta tipo doctor " + notification.data.tipoAtencion + ": " , this.alertas);
      this.alertas.unshift(alerta);
      this.saveAlertas();
      this.alertasChange.next(this.alertas);
    } 
    return alerta;
  }
}
