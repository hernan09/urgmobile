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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SaTiempoPage');
  }

  gotoPage(){
    this.navCtrl.setRoot( SaServiciosPage );
  }

}
