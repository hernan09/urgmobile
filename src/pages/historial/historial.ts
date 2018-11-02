import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import { NavController, Content } from "ionic-angular";
import { HistorialDetallePage } from "../historial-detalle/historial-detalle";
import { DataService } from "../../providers/data.service";
import { Utils } from "../../providers/utils";

@Component({
  selector: "page-historial",
  templateUrl: "historial.html"
})
export class HistorialPage {
  @ViewChild(Content)
  content: Content;
  private showSubHeader = true;
  private scrollTopStart;
  public historialIsEmpty;
  public historial;
  public historialMessage;

  public telefono;

  title = 'Historial de Atención'

  constructor(
    private ref: ChangeDetectorRef,
    public navCtrl: NavController,
    public dataService: DataService,
    public utils: Utils
  ) {
    this.historialIsEmpty = false;

    //Trae del LocalStorage y luego llama al servicio para actulizar
    this.fillHistorialData();
    dataService.getHistorial().subscribe(this.handleData.bind(this), this.handleError.bind(this));

    this.telefono = dataService.getPhoneNumber();
  }

  handleData(data) {
    console.log("Historial:", data);
    if (data) {
      if (data.historialAtencion) {
        this.historialIsEmpty = false;
        this.historial = this.formatData(data.historialAtencion);
        this.utils.hideLoader();
      } else {
        this.historialIsEmpty = true;
        this.historial = [];
        this.historialMessage = data.mensaje;
        this.utils.hideLoader();
      }
    } else {
      this.historialIsEmpty = true;
      console.log("Fallo el servicio");
      this.utils.hideLoader();
    }
  }

  handleError(err) {
    this.handleData(this.dataService.restoreHistorial());
  }

  formatData(data) {
    return data.map(el => {
      let fecha = el.fecha.split("T")[0];
      fecha =
        fecha.substring(8, 10) +
        "-" +
        fecha.substring(5, 7) +
        "-" +
        fecha.substring(0, 4);
      return { ...el, fecha };
    });
  }

  ionViewDidLoad() {
    this.content.ionScrollStart.subscribe(data => {
      this.scrollTopStart = data.scrollTop;
    });
    this.content.ionScrollEnd.subscribe(data => {
      let scrollDiff = data.scrollTop - this.scrollTopStart;
      if (scrollDiff > 20) {
        this.showSubHeader = false;
        this.ref.detectChanges();
        this.scrollTopStart = data.scrollTop;
      } else if (scrollDiff < -20) {
        this.showSubHeader = true;
        this.ref.detectChanges();
        this.scrollTopStart = data.scrollTop;
      }
    });
    this.content.ionScroll.subscribe(data => {
      let scrollDiff = data.scrollTop - this.scrollTopStart;
      if (scrollDiff > 20) {
        this.showSubHeader = false;
        this.ref.detectChanges();
        this.scrollTopStart = data.scrollTop;
      } else if (scrollDiff < -20) {
        this.showSubHeader = true;
        this.ref.detectChanges();
        this.scrollTopStart = data.scrollTop;
      }
    });
  }

  goToDetail(visita) {
    this.navCtrl.push(HistorialDetallePage, { visita });
  }

  nextPhoneNumber() {
    this.telefono = this.dataService.nextPhoneNumber();
  }

  fillHistorialData() {
    let data = this.dataService.restoreHistorial(this.utils.getActiveUser());
    if (data) {
      if (data.historialAtencion) {
        this.historial = this.formatData(data.historialAtencion);
        this.historialIsEmpty = false;
      } else if (data.mensaje) {
        this.historialIsEmpty = true;
        this.historialMessage = data.mensaje;
      }
    } else {
      this.historialIsEmpty = false;
      this.utils.showLoader(false);
    }
  }
}
