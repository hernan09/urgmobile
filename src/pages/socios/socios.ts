import { Observable } from 'rxjs';
import { AlertService } from '../../providers/alert.service';
import { Config } from './../../app/config';
import { NetworkService } from './../../providers/network.service';
import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms'
import { SolicitudVcPage } from '../solicitud-vc/solicitud-vc';
import { DataService } from '../../providers/data.service';
import { HomePage } from '../home/home';
import { Utils } from '../../providers/utils'
import { ToastService } from '../../providers/toast.service';



@Component({
    selector: 'page-socios',
    templateUrl: 'socios.html',
})

export class SociosPage {

    private socios: any[]
    private socioActual: any
    private sociosDNI: any
    private telefono: any;  
    public static pageName: string = "SociosPage";  

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, 
        private dataService: DataService, private networkService:NetworkService, 
        private toastService:ToastService, private alertService : AlertService) {
        this.getSocios()
        this.telefono = dataService.getPhoneNumber();
        if (this.navParams.get('socio')) {
            this.socioActual = this.getSociosByDni(this.navParams.get('socio'));
        }

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
            this.navCtrl.setRoot(SolicitudVcPage, { socio: this.socioActual, email: response.email, tel : telefono}, { animate: true, direction: 'back' })

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
}
