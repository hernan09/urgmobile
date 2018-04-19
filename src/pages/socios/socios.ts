import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms'
import { SolicitudVcPage } from '../solicitud-vc/solicitud-vc';
import { DataService } from '../../providers/data.service';
import { HomePage } from '../home/home';
import { Utils } from '../../providers/utils'



@Component({
  selector: 'page-socios',
  templateUrl: 'socios.html',
})

export class SociosPage {

  private socios:any[]
  private socioActual:any

  constructor(public navCtrl: NavController, public navParams: NavParams, public utils :Utils, private dataService :DataService) {    
    this.getSocios()
    if(this.navParams.get('socio')){
      this.socioActual = this.getSociosByDni(this.navParams.get('socio'));
    }   
    console.log(this.socioActual); 
  }

  ionViewDidLoad() {
  }

  requestVCPage(socio){
    console.log('Entra en request VC')
    this.dataService.validarVC(socio.dni).subscribe(this.validateVCResponse.bind(this));
  }  
 

  validateVCResponse(responseValidateVC){
    //dependiendo la respuesta del servicio es el mensaje que muestro
    if(responseValidateVC.estadoVC == "Activo"){
      console.log(this.socioActual.dni);
      this.navCtrl.setRoot(SolicitudVcPage, { socio : this.socioActual}, {animate: true, direction: 'back'})
      
    }   //momentaneamente hardcodeado porque siempre me responde que si
    else {
      this.utils.showAlert( "Video Consulta","El servicio de Video Consulta no se encuentra disponible. Comuníquese con 0810-333-3511");
      this.navCtrl.setRoot(HomePage);
    }
  }

  getSocios(){    
    let usersDni = this.dataService.restoreUsers();
    let usersData = [];

    for (let i = 0; i < usersDni.length; i++) {
        //en caso de no tener el paramatro de dni, se agrega
        this.dataService.getDatosSocio(usersDni[i]);

        usersData.push(this.dataService.restoreMisDatos(usersDni[i]));           
    }    
    this.socios = usersData;           
  }

  getSociosByDni(socio){
    return this.socios.find(x => x.datosCredencial[0].nroasociado === socio.datosCredencial[0].nroasociado);
  }


  previusPage(){
    this.navCtrl.setRoot(HomePage);
  }
}
