import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaConsultaPage } from '../sa-consulta/sa-consulta';
import { SolicitudAtencionPage } from '../solicitud-atencion/solicitud-atencion';
import { NavigatorPage } from './../navigator/navigator';
import { ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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

  profileForm = new FormGroup({
    cod: new FormControl('', Validators.required),
    tel: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    location: new FormControl('', Validators.required),
    direction: new FormControl('', Validators.required),
  })

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.selectOptions = {
      title: 'Localidad',
    };

    this.getLocation();
  }

  ionViewDidLoad() {
    this.menu.setArrowBack(true);
  }

  getDataContact() {
    console.log("data", this.profileForm.value);
    this.gotoPage();
  }

  previusPage() {
    this.navCtrl.setRoot( SolicitudAtencionPage );
  }

  gotoPage(){
    this.navCtrl.push( SaConsultaPage );
  }

  getLocation(){
    this.location = [ 'Córdoba','Santa Fe', 'Rosario', 'Funes',  'Roldan', 'Otra'  ];
  }

}
