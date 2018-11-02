import { Keyboard } from '@ionic-native/keyboard';
import { Config } from './../../app/config';
import { AlertService } from './../../providers/alert.service';
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
import { NavigatorPage } from './../navigator/navigator';
import { ModalService } from './../../providers/modal.service';

@Component({
    selector: 'page-solicitud-vc',
    templateUrl: 'solicitud-vc.html',
})
export class SolicitudVcPage implements Overlay {

    @ViewChild(Select) symptomSelect: Select;
    @ViewChild(NavigatorPage) menu : NavigatorPage;

    private dni: string;
    private name: string;
    private prefijo : number;
    private tel: number;
    private symptom: string;
    public symptoms: any[];
    private showSelectText: string;
    public selectTextColor: string = '#EE4035';
    public selectOptions;
    private telefono;
    private email : string;
    private iskeyboardOpen;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public utils: Utils,
        private dataService: DataService,
        private device: Device,
        private networkService: NetworkService,
        private toastService:ToastService,
        private alertService : AlertService,
        private keyboard: Keyboard,
        private modal : ModalService) {

        this.telefono = dataService.getPhoneNumber();
        dataService.getSintomas().subscribe(this.handleData.bind(this), this.handleData.bind(this))
        this.showSelectText = "Seleccionar";
        this.selectOptions = {
            cssClass:"hideHeader"
        }
        this.keyboard.onKeyboardShow().subscribe((data) => {
                this.iskeyboardOpen = true;
         });
         this.keyboard.onKeyboardHide().subscribe((data) => {
                this.iskeyboardOpen = false;
         });
    }

    ionViewCanEnter(){
        this.menu.setArrowBack(true);
    }

    handleData(data) {
        console.log('Sintomas:', data)
        if (data && data.length) this.symptoms = data
        else this.alertService.showAlert(Config.TITLE.WE_ARE_SORRY, Config.MSG.HISTORIAL_EMPTY,Config.ALERT_CLASS.ERROR_CSS)
    }

    ionViewDidLoad() {
        //asigno mi name al socio que recibo de la pantalla anterior
        console.log(this.navParams.get('socio').dni);
        this.name = this.navParams.get('socio').nombre + " " + this.navParams.get('socio').apellido || "";

        this.dni = this.navParams.get('socio').dni || "";
        this.tel = this.navParams.get('tel').numero || "";
        this.prefijo = this.navParams.get('tel').prefijo || "";
        this.email = this.navParams.get('email') || "";
    }

    sendVCRequest() {
        if(this.networkService.isNetworkConnected()){
            if(!this.validateEmail(this.email)){
                this.alertService.showAlert(Config.TITLE.WRONG_EMAIL, Config.MSG.WRONG_EMAIL_ERROR,Config.ALERT_CLASS.ERROR_CSS);
                console.log("El formato de email no es el correcto");
            }
            else if(!this.checkTelLength()){
                this.alertService.showAlert(Config.TITLE.WRONG_NUMBER, Config.MSG.WRONG_NUMBER_ERROR,Config.ALERT_CLASS.ERROR_CSS);
                    console.log("Cantidad de numeros del telefono debe sumar 10");
                }
                else{
                    this.utils.showLoader(false);
                //llamo al servicio de solicitarVC de mi dataService
                let requestParam = { "dni": this.dni, "te": this.prefijo + this.tel, "codigodeSintoma": this.symptom, "versionAndroid" : this.device.version , "email" : this.email};
                console.log("sendVCRequest - response:", requestParam);
                this.dataService.solicitarVC(requestParam).subscribe(this.VCResponse.bind(this));
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
            this.alertService.showAlert("Video Consulta", data.Mensaje,Config.ALERT_CLASS.OK_CSS);
            this.toastService.showToast(Config.MSG.DATA_SAVED,2000);
        }
        else {
            this.utils.hideLoader();
            console.log("VCResponse - data.registroVC: ",data.registroVC);
            this.alertService.showAlert("Video Consulta", data.Mensaje,Config.ALERT_CLASS.OK_CSS);
        }
        this.navCtrl.setRoot(HomePage);
    }

    previusPage() {
      let users = this.dataService.restoreUsers();
      if(users.length == 1){
          this.navCtrl.setRoot(HomePage);
      }
      else{
          this.navCtrl.setRoot(SociosPage, { socio: this.navParams.get('socio') });
      }
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

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }


     closeAllOverlays(){
            this.symptomSelect.close();
            this.alertService.hideAlert();
    }

    nextPhoneNumber(){
        this.dataService.nextPhoneNumber();
    }

    public backButtonAction() {
        if(this.symptomSelect.isFocus()){
            this.closeAllOverlays();
        }
        else{
            this.previusPage();
        }
     }


}
