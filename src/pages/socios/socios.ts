import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms'
import { SolicitudVcPage } from '../solicitud-vc/solicitud-vc';
import { DataService } from '../../providers/data.service';
import { HomePage } from '../home/home';



@Component({
  selector: 'page-socios',
  templateUrl: 'socios.html',
})

export class SociosPage {

  private socios:any[]
  private socioActual:any

  constructor(public navCtrl: NavController, public navParams: NavParams, private dataService :DataService) {    
    this.getSocios()
    if(this.navParams.get('socio')){
      //this.socioActual = ;
      this.socioActual = this.getSociosByDni(this.navParams.get('socio'));
    }   
    console.log(this.socioActual); 
  }

  ionViewDidLoad() {
  }

  requestVCPage(socio){
    //voy a la pagina de solicitud de videoConsulta y le paso el parametro socio que recibo por parametro.
    console.log(socio)
    this.navCtrl.setRoot(SolicitudVcPage, { socio }, {animate: true, direction: 'back'})
  }  
 

  getSocios(){    
    let usersDni = this.dataService.restoreUsers();
    let usersData = [];

    for (let i = 0; i < usersDni.length; i++) {
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
