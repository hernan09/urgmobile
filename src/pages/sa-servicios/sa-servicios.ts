import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SaServiciosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sa-servicios',
  templateUrl: 'sa-servicios.html',
})
export class SaServiciosPage {
  dataService: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.getDataOption();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SaServiciosPage');
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
        img: './assets/img/ambulancia.jpg'
      }
    ]
  }

}
