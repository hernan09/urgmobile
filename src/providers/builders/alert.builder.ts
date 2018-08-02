import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import "rxjs/Rx";
import "rxjs/add/operator/map";
import { Subject } from "rxjs/Subject";
import { Utils, DUMMY_NOTIS } from "../utils";
import { ImageService } from "../image.service";

const ALERTA: any = {
  title: "Inicio",
  step: 0,
  asignacion: null,
  prearribo: {},
  estado: null,
  visible: true,
  doctor: {
    nombre: "",
    matricula: null,
    especialidad: "",
    foto: ""
  },
  poll: {
    question: "",
    rate: 0,
    label: "",
    comment: "",
    thanks: false
  }
};

@Injectable()
export class AlertBuilder {

  private alertaObservable: Subject<any>;

  public constructor(private imageService: ImageService) {
    this.alertaObservable = new Subject<any>();
  }

  public getAlertaObservable(): Observable<any> {
    return this.alertaObservable;
  }

  public createNewAlerta(notification) {
    console.log("Entra a createNewAlerta: ", notification);

    if (!notification) return;

    console.log("Updating alertas:", notification.androidNotificationId);
    let alerta = JSON.parse(JSON.stringify(ALERTA));
    alerta.title = notification.title;
    alerta.androidNotificationId = notification.androidNotificationId;
    alerta.order = notification.order;

    if (notification.data.preguntas && notification.data.preguntas.length) {
      alerta.step = 4;
      alerta.androidNotificationId = notification.androidNotificationId;
      alerta.title = "Encuesta de satisfacción";
      alerta.poll.question = notification.data.preguntas[0];
      alerta.poll.thanks = false;
      alerta.visible = true;
      setTimeout(_ => this.alertaObservable.next(alerta), 1000);
    } else {
      alerta.title = notification.title;
      alerta.androidNotificationId = notification.androidNotificationId;

      switch (notification.data.tipoAtencion) {
        case "1":
          alerta.step = 1;
          alerta.asignacion = notification.data.contenido;
          alerta.visible = true;
          setTimeout(_ => this.alertaObservable.next(alerta), 1000);

          break;
        case "2":
          alerta.step = 2;
          alerta.prearribo.consejos = [notification.data.contenido];
          alerta.visible = true;
          setTimeout(_ => this.alertaObservable.next(alerta), 1000);
          break;
        case "3":
          this.fillDoctorData(
            alerta,
            3,
            notification,
            notification.data.nombreMedico,
            "El médico está en camino",
            "Horario estimado de arribo",
            notification.data.hora,
            true
          ).subscribe(data => {
            this.alertaObservable.next(data);
          });
          break;
        case "4":
          this.fillDoctorData(
            alerta,
            3,
            notification,
            notification.data.nombreMedico,
            "El médico está demorado",
            "Nuevo horario de arribo",
            notification.data.hora,
            false
          ).subscribe(data => {
            this.alertaObservable.next(data);
          });
          break;
        case "5":
          this.fillDoctorData(
            alerta,
            3,
            notification,
            notification.data.nombreMedico,
            "El médico arribó al domicilio",
            "Horario estimado de arribo",
            notification.data.hora,
            true
          ).subscribe(data => {
            this.alertaObservable.next(data);
          });
          break;
        case "6":
          alerta.step = 5;
          alerta.estado = {
            status: "Video Consulta Activa",
            label: "Tenés una Video Consulta en Curso",
            hora: notification.data.hora,
            cid: notification.data.contenido,
            dni: notification.data.dni,
            ok: true
          };
          setTimeout(_ => this.alertaObservable.next(alerta), 1000);
          break;
      }
    }
  }

  private fillDoctorData(
    alerta,
    step,
    notification,
    nNombreMedico,
    alertaStatus,
    alertaLabel,
    alertaHora,
    alertaOk
  ): Observable<any> {
    console.log("Entra a fillDoctorData: ", alerta);
    let alertaObs: Subject<any> = new Subject<any>();

    alerta.step = step;

    alerta.estado = {
      status: alertaStatus,
      label: alertaLabel,
      hora: alertaHora,
      ok: alertaOk
    };
    alerta.doctor = {
      nombre: nNombreMedico,
      matricula: notification.data.matriculaMedico,
      especialidad: notification.data.especialidadMedico
    };

    this.getDoctorPhoto(alerta, notification).subscribe(data => {
      alertaObs.next(data);
    });
    return alertaObs;
  }

  private getDoctorPhoto(alerta, notification): Observable<any> {
    console.log("Entra a getDoctorPhoto: ", alerta, notification);
    let alertaObs: Subject<any> = new Subject<any>();

    if (notification.data.fotoMedico) {
      this.imageService.downloadImage(notification.data.fotoMedico).subscribe(
        data => {
          console.log("Alerta: ", alerta);
          if (data != null) {
            alerta.doctor.foto = data;
          } else {
            alerta.doctor.foto = "";
          }
          alerta.visible = true;
          alertaObs.next(alerta);
        },
        err => {
          console.error(err);
          alertaObs.next(alerta);
        }
      );
    } else {
      alerta.doctor.foto = "";
      alerta.visible = true;
      alertaObs.next(alerta);
    }
    return alertaObs;
  }
}
