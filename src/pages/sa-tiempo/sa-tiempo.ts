import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaServiciosPage } from '../sa-servicios/sa-servicios';
import { SaConsultaPage } from '../sa-consulta/sa-consulta';
import { NavigatorPage } from './../navigator/navigator';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  @ViewChild(NavigatorPage) menu : NavigatorPage;
  time:any;
  period:boolean;

  profileForm = new FormGroup({
    time: new FormControl('', Validators.required),
  })
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.getTime();
  }

  ionViewDidLoad() {
    this.menu.setArrowBack(true);
  }

  getDataTime() {
    console.log("data", this.profileForm.value);
    this.gotoPage();
  }

  getTime() {
    this.time =
    [
      {
        period: "Menos de una semana"
      },{
        period: "Entre una y dos semanas"
      },{
        period: "Más de dos semanas"
      }
    ]
  }

  previusPage() {
    this.navCtrl.setRoot( SaConsultaPage );
  }

  gotoPage(){
    this.navCtrl.push( SaServiciosPage );
  }

}
