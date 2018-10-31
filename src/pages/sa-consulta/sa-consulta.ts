import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaTiempoPage } from '../sa-tiempo/sa-tiempo';
import { SaContactoPage } from '../sa-contacto/sa-contacto';
import { NavigatorPage } from './../navigator/navigator';
import { FormGroup, FormControl, Validators } from '@angular/forms';
/**
 * Generated class for the SaConsultaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sa-consulta',
  templateUrl: 'sa-consulta.html',
})

export class SaConsultaPage {
  @ViewChild(NavigatorPage) menu : NavigatorPage;
  selectOptions:any;
  symptom:any;

  profileForm = new FormGroup({
    symptom: new FormControl('', Validators.required),
  })

  constructor( public navCtrl: NavController, public navParams: NavParams ) {

    this.selectOptions = {
      title: 'Síntoma',
    };

    this.getSymptom();
  }

  ionViewDidLoad() {
    this.menu.setArrowBack(true);
  }

  getDataSymptom() {
    console.log("data", this.profileForm.value);
    this.gotoPage();
  }

  previusPage() {
    this.navCtrl.setRoot( SaContactoPage );
  }


  gotoPage(){
    this.navCtrl.push( SaTiempoPage );
  }

  getSymptom() {
    this.symptom = [ 'Constipación', 'Diarrea', 'Fiebre', 'Síntomas de la piel', 'Alteraciones oculares', 'Dolor de garganta', 'Resfrio' ];
  }
}
