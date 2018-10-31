import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SaTiempoPage } from '../sa-tiempo/sa-tiempo';
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
  selectOptions:any;
  symptom:any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.selectOptions = {
      title: 'Síntoma',
    };

    this.getSymptom();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SaConsultaPage');
  }

  gotoPage(){
    this.navCtrl.setRoot( SaTiempoPage );
  }

  getSymptom() {
    this.symptom = [ 'Constipación', 'Diarrea', 'Fiebre', 'Síntomas de la piel', 'Alteraciones oculares', 'Dolor de garganta', 'Resfrio' ];
  }

}
