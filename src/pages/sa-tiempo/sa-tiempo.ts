import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaServiciosPage } from '../sa-servicios/sa-servicios';
/**
 * Generated class for the SaTiempoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sa-tiempo',
  templateUrl: 'sa-tiempo.html',
})
export class SaTiempoPage {
  time:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.getTime();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SaTiempoPage');
  }

  getTime(){
    this.time = [
      {
        period: "Menos de una semana"
      },{
        period: "Entre una y dos semanas"
      },{
        period: "Más de dos semanas"
      }
    ]
  }

  gotoPage(){
    this.navCtrl.setRoot( SaServiciosPage );
  }

}
