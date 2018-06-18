import { ToastService } from './../../providers/toast.service';
import { NetworkService } from './../../providers/network.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SociosPage } from '../socios/socios';
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config';
import { HomePage } from '../home/home';
import { DataService } from '../../providers/data.service'
import { Device } from '@ionic-native/device';

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
    prefijo : number;
    tel: number;
    symptom: string;
    symptoms: any[];
    showSelectText: string;
    selectTextColor: string = '#EE4035';
    selectOptions;
    telefono;

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, 
        private dataService: DataService, private device: Device, private networkService: NetworkService, private toastService:ToastService) {   
        this.telefono = dataService.getPhoneNumber();
        dataService.getSintomas().subscribe(this.handleData.bind(this), this.handleData.bind(this))
        this.showSelectText = "Seleccionar";
        this.selectOptions = {
            cssClass:"hideHeader"
        }
    }

    handleData(data) {
        console.log('Sintomas:', data)
        if (data && data.length) this.symptoms = data
        else this.utils.showAlert('Lo sentimos', Config.MSG.HISTORIAL_EMPTY)
    }

    ionViewDidLoad() {
        //asigno mi name al socio que recibo de la pantalla anterior
        console.log(this.navParams.get('socio').dni);
        this.name = this.navParams.get('socio').nombre;
        this.lastname = this.navParams.get('socio').apellido;
        this.dni = this.navParams.get('socio').dni

    }

    sendVCRequest() {
        if(this.networkService.isNetworkConnected()){
            if(this.checkTelLength()){
                this.utils.showLoader(false);
                console.log("deviceInfo:", this.device.version);
                //llamo al servicio de solicitarVC de mi dataService
                //let response = { "dni": this.dni, "te": this.prefijo + this.tel, "codigodeSintoma": this.symptom };
                let response = { "dni": this.dni, "te": this.prefijo + this.tel, "codigodeSintoma": this.symptom, "versionAndroid" : this.device.version };
                console.log("response:", response);
                this.dataService.solicitarVC(response).subscribe(this.VCResponse.bind(this));
                }
                else{
                    this.utils.showAlert("Número de telefono erroneo", "La suma del prefijo y el número de telefono debe ser de 10 caracteres");
                    console.log("no suma 10 los caracteres del telefono")
                }
        }
        else{
            this.toastService.hideToast();
            this.toastService.showToast(Config.MSG.DISCONNECTED,0);
        }       
        
    }

    VCResponse(data) {
        //dependiendo la respuesta del servicio es el mensaje que muestro
        if (data.registroVC == "SI") {
            this.utils.hideLoader();
            this.utils.showAlert("Video Consulta", data.Mensaje);
            this.navCtrl.setRoot(HomePage)
        }
        else {
            this.utils.hideLoader();
            this.utils.showAlert("Video Consulta", data.Mensaje);
        }
    }

    previusPage() {
        this.navCtrl.setRoot(SociosPage, { socio: this.navParams.get('socio') })
    }

    onChangeSymptom() {
        this.selectTextColor = 'transparent';
    }
    
    checkTelLength(){
        if((this.prefijo+ this.tel).toString().length == 10){
            return true;
        }
        else{
            return false;
        }
    }

    nextPhoneNumber() {
		this.telefono = this.dataService.nextPhoneNumber();
    }   
    

}
