import { LoginService } from './../../providers/login.service';
import { NetworkService } from './../../providers/network.service';
import { Component, ViewChild } from '@angular/core'
import { NavController, NavParams, MenuController } from 'ionic-angular'
import { FormGroup, FormControl } from '@angular/forms'
import { Observable } from "rxjs";

import { TycsPage } from '../tycs/tycs'
import { HomePage } from '../home/home'

import { CheckerComponent } from '../../components/checker'

import { AuthService } from '../../providers/auth.service'
import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config'
import { NotificationsService } from '../../providers/notifications.service'
import { ToastService } from '../../providers/toast.service';


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
    public telefono: String;

    @ViewChild(CheckerComponent) checker: CheckerComponent

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
            this.checker.showError(Config.MSG.ERROR);
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
        this.show = '';
        this.checker.hide();
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
            this.checker.showChecking()
            this.auth.checkPreguntas(this.preguntas)
                .then(ok => {
                    this.p = null
                    this.auth.answer(this.user.dni, true).subscribe(
                        data => {//Luego de que se contestaron las preg OK llamamos a OS y a la BE para registrar DNI
                            this.notiService.init(this.navCtrl)
                                .then(data => this.deviceRegistration(data))
                                .catch(error => this.throwError(error))
                        },
                        err => { this.throwError(err); })
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
        this.checker.showError(err.text());
        this.show = 'callus';
    }

    private showAnswerError(data) {

        this.preguntas = this.formatQuestions(JSON.parse(data.questionList).preguntas);
        this.checker.showError(data.answerWrong);
        this.show = 'retry';

    }

    private deviceRegistration(data: any) {
        const deviceId = data.userId // oneSignalPlayerID
        console.log(`Device ID is [${deviceId}]`)
        this.dataService.registrarDispositivo(deviceId, this.user.dni).subscribe(
            dataResponse => {
                this.checker.showOk(Config.MSG.REGISTER_OK)
                this.loginService.login(this.user.dni)

                setTimeout(_ => this.navCtrl.setRoot(HomePage), 2000)
            },
            err => {
                console.warn('Could not get device ID:', err)
                return Observable.throw("Server error");
            });
    }

    private throwError(error: any) {
        {
            console.log(error);
            this.checker.showError(error);
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

    getBlockUserPhoneNumber(index: number) {
        this.telefono = this.dataService.getBlockUserPhoneNumber();
    }


}
