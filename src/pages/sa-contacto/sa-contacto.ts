import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaConsultaPage } from '../sa-consulta/sa-consulta';

/**
 * Generated class for the SaContactoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sa-contacto',
  templateUrl: 'sa-contacto.html',
})
export class SaContactoPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SaContactoPage');
  }

  gotoPage(){
    this.navCtrl.setRoot( SaConsultaPage );
  }

}
