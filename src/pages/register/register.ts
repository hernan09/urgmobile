import { LoginService } from './../../providers/login.service';
import { NetworkService } from './../../providers/network.service';
import { Component, ViewChild } from '@angular/core'
import { NavController, NavParams, MenuController } from 'ionic-angular'
import { FormGroup, FormControl } from '@angular/forms'
import { Observable } from "rxjs";

import { LoginPage } from '../login/login';
import { TycsPage } from '../tycs/tycs'
import { HomePage } from '../home/home'


import { AuthService } from '../../providers/auth.service'
import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config'
import { NotificationsService } from '../../providers/notifications.service'
import { ToastService } from '../../providers/toast.service';
import { AlertService } from './../../providers/alert.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { CallNumber } from '@ionic-native/call-number';


@Component({
    selector: 'page-register',
    templateUrl: 'register.html',
})

export class RegisterPage {
    public i: any;
    public p: any;
    public form: any;
    public user: any = {};
    public preguntas: any = [];
    public show: string = '';
    public last: boolean = false;
    public hasChosen: boolean = false;
    public tycs: boolean = false;
    public mostrarBtnFinalizar: boolean = true;
    public telefono: string;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public auth: AuthService,
        public dataService: DataService,
        public utils: Utils,
        public notiService: NotificationsService,
        private menu: MenuController,
        private networkService: NetworkService,
        private toastService: ToastService,
        private loginService: LoginService,
        private alertService : AlertService,
        private callNumber: CallNumber
    ) {
        this.telefono = dataService.getPhoneNumber()
        this.form = new FormGroup({
            "pregs": new FormControl({ value: '', disabled: false })
        });

    }

    ionViewDidEnter() {
        this.menu.swipeEnable(false);
    }

    ionViewWillLeave() {
        this.menu.swipeEnable(true);
    }

    ionViewDidLoad() {
        this.resetVariables();
        this.user.dni = this.navParams.get('dni');
        const pregs = JSON.parse(this.navParams.get('data').questionList).preguntas;
        if (pregs && pregs.length) {
            this.preguntas = this.formatQuestions(pregs);
            this.nextAnswer();
        }
        else {
            this.alertService.showAlert(Config.MSG.ERROR,'',Config.ALERT_CLASS.ERROR_CSS); 
        }
    }

    nextAnswer() {
        if (this.last) {
            this.checkPreguntas();
            this.mostrarBtnFinalizar = false;
        }
        else {
            this.p = this.preguntas[this.i++];
            this.last = this.i === this.preguntas.length;
            this.hasChosen = false;
        }
    }

    resetVariables() {
        this.i = 0;
        this.last = false;
        this.tycs = false;
        this.mostrarBtnFinalizar = true;
    }

    retry() {
        this.resetVariables();        
        this.nextAnswer();
    }

    goToTycs() {
        this.navCtrl.push(TycsPage)
    }

    getValor(p) {
        if (!p || !p.opciones) return ''
        let rta = p.opciones.find(o => o.valor == p.respuesta)
        return rta ? rta.texto : ''
    }

    checkPreguntas() {       
        console.log('checkPreguntas:', this.preguntas)
        if (this.networkService.isNetworkConnected()) {
            this.auth.checkPreguntas(this.preguntas)
                .then(ok => {
                    this.p = null
                    this.auth.answer(this.user.dni, true).subscribe(
                        data => {//Luego de que se contestaron las preg OK llamamos a OS y a la BE para registrar DNI
                            this.notiService.init(this.navCtrl)
                                .then(data => this.deviceRegistration(data))
                                .catch(
                                    error => this.throwError(error)
                                    
                                )
                        },
                        err => { 
                             this.throwError(err);
                         })
                })
                .catch(err => {
                    console.log(err)
                    this.p = null
                    this.auth.answer(this.user.dni, false).subscribe(
                        data => {
                            this.showAnswerError(data);     
                        },
                        err => {
                            this.showcallUsError(err);     
                        })
                })
        }
        else {
            this.toastService.hideToast();
            this.toastService.showToast(Config.MSG.DISCONNECTED, 0);
        }

    }

    private showcallUsError(err) {      
        this.navCtrl.setRoot(LoginPage); 
        let phone = this.dataService.getBlockUserPhoneNumber();
        let alert = this.alertService.showOptionAlert('Atención',err.text(),'Llamanos',Config.ALERT_OPTIONS.CANCELAR,Config.ALERT_CLASS.ERROR_CSS, () => {window.location.href = "tel:" + phone});
        alert.present();
    }  

    private showAnswerError(data) {
        this.preguntas = this.formatQuestions(JSON.parse(data.questionList).preguntas);
        this.retry();
        this.alertService.showAlert(data.answerWrong,'',Config.ALERT_CLASS.ERROR_CSS,"Reintentar"); 
    }   

    private deviceRegistration(data: any) {
        const deviceId = data.userId // oneSignalPlayerID
        console.log(`Device ID is [${deviceId}]`)
        
        
        this.dataService.registrarDispositivo(deviceId, this.user.dni).subscribe(
            dataResponse => {                
                this.alertService.showAlert(Config.MSG.REGISTER_OK,'',Config.ALERT_CLASS.OK_CSS,"Continuar");                
                this.loginService.login(this.user.dni)
                this.navCtrl.setRoot(HomePage);
            },
            err => {
                console.warn('Could not get device ID:', err)
                return Observable.throw("Server error");
            });
    }

    private throwError(error: any) {
        {
            console.log(error); 
        }
    }

    formatQuestions(questions) {        
        return questions.map(q => {
            let correcta
            let opciones = []
            q.respuestas.forEach((r, i) => {
                opciones.push({
                    texto: r.respuesta,
                    valor: i
                })
                if (this.utils.isTrue(r.valida)) correcta = i
            })
            return {
                texto: q.pregunta,
                opciones,
                correcta,
                respuesta: null
            }
        })
    }
}
