import { ChangeDetectorRef } from '@angular/core';
import { NavigatorPage } from './../navigator/navigator';
import { Observable } from 'rxjs';
import { AlertService } from '../../providers/alert.service';
import { Config } from './../../app/config';
import { NetworkService } from './../../providers/network.service';
import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms'
import { SolicitudVcPage } from '../solicitud-vc/solicitud-vc';
import { SaContactoPage } from '../sa-contacto/sa-contacto';
import { DataService } from '../../providers/data.service';
import { HomePage } from '../home/home';
import { Utils } from '../../providers/utils'
import { ToastService } from '../../providers/toast.service';
import { ViewChild } from '@angular/core';

/**
 * Generated class for the SolicitudAtencionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-solicitud-atencion',
  templateUrl: 'solicitud-atencion.html',
})

export class SolicitudAtencionPage {

    private socios: any[]
    private socioActual: any
    private sociosDNI: any
    private telefono: any;
    public static pageName: string = "SociosPage";
    @ViewChild(NavigatorPage) menu : NavigatorPage;

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils,
        private dataService: DataService, private networkService:NetworkService,
        private toastService:ToastService, private alertService : AlertService, private ref: ChangeDetectorRef) {


        this.getSocios();
        this.telefono = dataService.getPhoneNumber();
        if (this.navParams.get('socio')) {
            this.socioActual = this.getSociosByDni(this.navParams.get('socio'));
        }
        console.log("estoy en la pagina de socios");

    }

  ionViewCanEnter(){
      this.menu.setArrowBack(true);
      // this.sociosDNI = this.dataService.restoreUsers();
      // if(this.sociosDNI.length == 1){
      //     this.socioActual = this.dataService.restoreMisDatos(this.sociosDNI[0]);
      //     this.dataService.validarVC(this.sociosDNI[0], "NO").subscribe(this.validateVCResponse.bind(this));
      // }
  }

  requestVCPage(socio) {
      if(this.networkService.isNetworkConnected()){
          console.log('Entra en request VC')
          this.utils.showLoader(false);
          this.dataService.validarVC(socio.dni, "NO").subscribe(this.validateVCResponse.bind(this));
      }
      else{
          this.toastService.hideToast();
          this.toastService.showToast(Config.MSG.DISCONNECTED,0);
      }
  }

  validateVCResponse(responseValidateVC) {
      //Se muestra un mensaje diferente dependiendo la respuesta del servicio validar VC
      let response = this.dataService.getResponseData(responseValidateVC);
      if (response.estadoVC == "Activo") {
          let telefono = {prefijo: response.telefonoCaracteristica, numero: response.telefonoNumero}
          this.utils.hideLoader();
          this.navCtrl.setRoot(SaContactoPage, { socio: this.socioActual, email: response.email, tel : telefono}, { animate: true, direction: 'back' })
      }
      else {
          this.utils.hideLoader();
          this.alertService.showAlert(Config.TITLE.VIDEO_CALL_TITLE, response.Mensaje);
          //Solo muestra ok y vuelve al home
          this.navCtrl.setRoot(HomePage);
      }
  }

  hideLoader(){
      this.utils.hideLoader();
  }

  getSocios() {
      const activeUser = this.utils.getActiveUser();

      if (this.dataService.isTitular(activeUser)) {
          this.sociosDNI = this.dataService.restoreUsers();
      }

      let usersData = [];

      for (let i = 0; i < this.sociosDNI.length; i++) {
          //en caso de no tener el paramatro de dni, se agrega
          this.dataService.getDatosSocio(this.sociosDNI[i]);

          usersData.push(this.dataService.restoreMisDatos(this.sociosDNI[i]));
      }
      this.socios = usersData;
  }

  getSociosByDni(socio) {
      return this.socios.find(x => x.datosCredencial[0].nroasociado === socio.datosCredencial[0].nroasociado);
  }

  previusPage() {
      this.navCtrl.setRoot(HomePage);
  }

  radioChecked(){
      //fuerzo el refresco para que actualice la variable socioActual
      this.ref.detectChanges();
  }

}
