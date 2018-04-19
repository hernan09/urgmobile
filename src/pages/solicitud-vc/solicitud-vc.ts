import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SociosPage } from '../socios/socios';
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config';
import { HomePage } from '../home/home';
import { DataService } from '../../providers/data.service'

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

  dni: string;
  name: string;
  lastname: string;
  tel: number;
  symptom: string;
  symptoms : any[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public utils :Utils, private dataService :DataService) {
      this.utils.showLoader()
      dataService.getSintomas().subscribe(this.handleData.bind(this), this.handleData.bind(this))  
  }

  handleData(data) {
      console.log('Sintomas:', data)
      if (data && data.length) this.symptoms = data
      else this.utils.showAlert('Lo sentimos', Config.MSG.HISTORIAL_EMPTY)
      this.utils.hideLoader()
  }

  ionViewDidLoad() {
    //asigno mi name al socio que recibo de la pantalla anterior
    console.log(this.navParams.get('socio').dni);
    this.name = this.navParams.get('socio').nombre;
    this.lastname = this.navParams.get('socio').apellido;
    this.dni = this.navParams.get('socio').dni
   
  }

  sendVCRequest(lastname, name, tel, symptom) {
    //llamo al servicio de solicitarVC de mi dataService
    
    let response = { "dni" : this.dni, "te" : tel, "codigodeSintoma" : symptom}; 
    this.dataService.solicitarVC(response).subscribe(this.VCResponse.bind(this));
  }

  VCResponse(data){
    //dependiendo la respuesta del servicio es el mensaje que muestro
    if(data.registroVC == "SI"){
      this.utils.showAlert( "Video Consulta",data.Mensaje);
      this.navCtrl.setRoot(HomePage)
    }
    //momentaneamente hardcodeado porque siempre me responde que si
    else this.utils.showAlert( "Video Consulta","Lo siento no se ha podido registrar la video consulta, verifique los datos ingresados");
  }

  previusPage(){
    this.navCtrl.setRoot(SociosPage, { socio : this.navParams.get('socio') })
  }
}
