import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SociosPage } from '../socios/socios';
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config';
import { HomePage } from '../home/home';

/**
 * Generated class for the SolicitudVcPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-solicitud-vc',
  templateUrl: 'solicitud-vc.html',
})
export class SolicitudVcPage {

  name: string;
  lastname: string;
  tel: number;
  symptom: string;
  symptoms : any[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public utils :Utils) {
    this.getSymptoms();
    this.utils.showLoader();
    
  }

  ionViewDidLoad() {
    //asigno mi name al socio que recibo de la pantalla anterior
    this.name = this.navParams.get('socio').nombre;
    this.lastname = this.navParams.get('socio').apellido;

  }

  sendVCRequest(lastname, name, tel, symptom) {
    console.log('nombre :' + name);
    console.log('apellido :' + lastname);
    console.log('telefono :' + tel);
    console.log('sintoma :' + symptom);
    this.utils.showAlert( "Video Consulta","La VideoConsulta ha sido registrada correctamente");
    this.navCtrl.setRoot(HomePage)

  }

  getSymptoms() {
    console.log("Invoco al servicio backend de sintomas");
    this.symptoms =
      [
        {
          "id": "1", "value": "ALTERACIONES OCULARES Y DE LA VISION"
        },
        {
          "id": "2", "value": "CONSTIPACION"
        },
        {
          "id": "3", "value": "DIARREA"
        },
        {
          "id": "4", "value": "EDEMA"
        },
        {
          "id": "5", "value": "FIEBRE"
        },
        {
          "id": "6", "value": "DOLOR O MOLESTIA DE GARGANTA (ODINOFAGIA)"
        },
        {
          "id": "7", "value": "RESFRIADO/GRIPE"
        },
        {
          "id": "8", "value": "HERIDA CORTANTE EN..."
        },
        {
          "id": "9", "value": "MORDEDURA DE.../PICADURA DE..."
        },
        {
          "id": "10", "value": "SINTOMAS DE LA PIEL"
        },
      ];
  }
  
  previusPage(){
    this.navCtrl.setRoot(SociosPage, { socio : this.navParams.get('socio') })
  }
}
