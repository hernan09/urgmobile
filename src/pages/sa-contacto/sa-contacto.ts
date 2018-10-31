import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaConsultaPage } from '../sa-consulta/sa-consulta';
import { NavigatorPage } from './../navigator/navigator';
import { ViewChild } from '@angular/core';
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

  @ViewChild(NavigatorPage) menu : NavigatorPage;
  selectOptions: any;
  location:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.selectOptions = {
      title: 'Localidad',
    };

    this.getLocation();
  }

  ionViewDidLoad() {
    // this.menu.setArrowBack(true);
  }

  gotoPage(){
    this.navCtrl.setRoot( SaConsultaPage );
  }
  getLocation(){
    this.location = [ 'Córdoba','Santa Fe', 'Rosario', 'Funes',  'Roldan', 'Otra'  ];
  }

}
