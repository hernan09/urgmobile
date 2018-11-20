import { Utils } from './../../providers/utils';
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
  telFinal:number;
  prefijoFinal:number;
  private prefijo : number;
  private tel: number;

  profileForm = new FormGroup({
    cod: new FormControl('', Validators.required),
    tel: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    location: new FormControl('', Validators.required),
    direction: new FormControl('', Validators.required),
  })

  title = 'Solicitud de Atención';

  constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils,) {

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

  validateTelNumber(number, length){  
    this.telFinal; 
     if(number === null || number === undefined) this.tel = undefined;
     else if(this.utils.validationInputTypeNumber(number,length)){
         this.telFinal = number;
     }
     else{
         this.tel = this.telFinal;
     }
 }

 validatePrefijoNumber(number, length){   
    this.prefijoFinal;
    if(number === null || number === undefined) this.prefijo = undefined;
    else if(this.utils.validationInputTypeNumber(number,length)){
        this.prefijoFinal = number;
    }
    else{
        this.prefijo = this.prefijoFinal;
    }
}


}
