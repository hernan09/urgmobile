import { Config } from './../../app/config';
import { AlertService } from './../../providers/alert.service';
import { VideoConsultaPage } from './../videoconsulta/videoconsulta';
import { Overlay } from './../../interfaces/overlay.interface';
import { ToastService } from './../../providers/toast.service';
import { NetworkService } from './../../providers/network.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SociosPage } from '../socios/socios';
import { Utils } from '../../providers/utils'
import { HomePage } from '../home/home';
import { DataService } from '../../providers/data.service'
import { Device } from '@ionic-native/device';
import { Select } from 'ionic-angular';
import { ViewChild } from '@angular/core';


@Component({
    selector: 'page-solicitud-vc',
    templateUrl: 'solicitud-vc.html',
})
export class SolicitudVcPage implements Overlay {

    @ViewChild(Select) symptomSelect: Select;

    private dni: string;
    private name: string;
    private lastname: string;
    private prefijo : number;
    private tel: number;
    private symptom: string;
    public symptoms: any[];
    private showSelectText: string;
    public selectTextColor: string = '#EE4035';
    public selectOptions;
    private telefono;    

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, 
        private dataService: DataService, private device: Device, private networkService: NetworkService, 
        private toastService:ToastService, private alertService : AlertService) {   
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
        else this.alertService.showAlert(Config.TITLE.WE_ARE_SORRY, Config.MSG.HISTORIAL_EMPTY)
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
                //llamo al servicio de solicitarVC de mi dataService
                let response = { "dni": this.dni, "te": this.prefijo + this.tel, "codigodeSintoma": this.symptom, "versionAndroid" : this.device.version };
                console.log("sendVCRequest - response:", response);
                this.dataService.solicitarVC(response).subscribe(this.VCResponse.bind(this));
                }
                else{
                    this.alertService.showAlert(Config.TITLE.WRONG_NUMBER, Config.MSG.WRONG_NUMBER_ERROR);
                    console.log("Cantidad de numeros del telefono debe sumar 10");
                    this.navCtrl.setRoot(HomePage);
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
            console.log("VCResponse - data.registroVC(SI): ",data.registroVC);
            this.alertService.showAlert("Video Consulta", data.Mensaje);
        }
        else {
            this.utils.hideLoader();
            console.log("VCResponse - data.registroVC: ",data.registroVC);
            this.alertService.showAlert("Video Consulta", data.Mensaje);
        }
        this.navCtrl.setRoot(HomePage)
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

    closeAllOverlays(){
        this.symptomSelect.close();         
        this.alertService.hideAlert();     
    }
    

}
