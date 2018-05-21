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

    private socios: any[]
    private socioActual: any
    private sociosDNI: any
    telefono;

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, private dataService: DataService) {
        this.getSocios()
        this.telefono = dataService.getPhoneNumber();
        if (this.navParams.get('socio')) {
            this.socioActual = this.getSociosByDni(this.navParams.get('socio'));
        }
        console.log(this.socioActual);
    }

    ionViewDidLoad() {
    }

    requestVCPage(socio) {
        console.log('Entra en request VC')
        this.utils.showLoader();
        this.dataService.validarVC(socio.dni).subscribe(this.validateVCResponse.bind(this));
    }


    validateVCResponse(responseValidateVC) {
        //dependiendo la respuesta del servicio es el mensaje que muestro
        if (responseValidateVC.estadoVC == "Activo") {
            this.utils.hideLoader();
            this.navCtrl.setRoot(SolicitudVcPage, { socio: this.socioActual }, { animate: true, direction: 'back' })

        }
        else {
            this.utils.hideLoader();
            this.utils.showAlert("Video Consulta", responseValidateVC.Mensaje);
            this.navCtrl.setRoot(HomePage);
        }
    }

    getSocios() {
        const activeUser = this.utils.getActiveUser();

        if (this.dataService.isTitular(activeUser)) {
            this.sociosDNI = this.dataService.restoreUsers();
        }
        else {
            this.sociosDNI = this.dataService.restoreGuestUsers();
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

    nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber();
	}
}
