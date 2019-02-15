import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaTiempoPage } from './../sa-tiempo/sa-tiempo';
import { NavigatorPage } from './../navigator/navigator';
/**
 * Generated class for the SaServiciosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-sa-servicios',
  templateUrl: 'sa-servicios.html',
})
export class SaServiciosPage {
  @ViewChild(NavigatorPage) menu : NavigatorPage;
  dataService: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.getDataOption();
  }

  ionViewDidLoad() {
    this.menu.setArrowBack(true);
  }

  getDataOption() {
    this.dataService = [
      {
        final:"una",
        type:"video Consulta Médica",
        description:"sin salir de tu casa",
        time:"10 minutos",
        img: './assets/img/videollamada.jpg'
      },{
        final:"un",
        type:"Medico a Domicilio",
        description:"",
        time:"01:30 horas",
        img: './assets/img/ambulancia.png'
      }
    ]
  }

  previusPage() {
    this.navCtrl.setRoot( SaTiempoPage );
  }

}
