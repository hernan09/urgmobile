import { LoginService } from './../../providers/login.service';
import { Overlay } from './../../interfaces/overlay.interface';
import { AlertService } from './../../providers/alert.service';
import { Config } from './../../app/config';
import { ToastService } from './../../providers/toast.service';
import { NetworkService } from './../../providers/network.service';
import { Component } from "@angular/core";
import { NavController, NavParams, MenuController } from "ionic-angular";
import { Platform } from "ionic-angular";

import { RegisterPage } from "../register/register";
import { HomePage } from "../home/home";

import { AuthService } from "../../providers/auth.service";
import { DataService } from "../../providers/data.service";
import { NotificationsService } from "../../providers/notifications.service";
import { Utils } from "../../providers/utils";

const ERROR_MSG = {
  500: Config.MSG.LOGIN_ERROR_DNI,
  502: Config.MSG.LOGIN_ERROR_BLOCKED
};

@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage implements Overlay {
  dni: number;
  telefono;
  newMember :boolean;
  button_text = "Ingresar";
  placeholder = "";

  version = Config.OPTIONS.VERSION_NUMBER;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private authService: AuthService,
    private dataService: DataService,
    private notiService: NotificationsService,
    private utils: Utils,
    private menu: MenuController,
    private platform: Platform,
    private networkService: NetworkService,
    private toastService : ToastService,
    private alertService : AlertService,
    private loginService:LoginService,
  ) {
    this.telefono = this.dataService.getPhoneNumber();
    this.newMember = this.navParams.get("newMember");

    if (authService.isAuthenticated() && !this.newMember) this.getDeviceID();

    this.placeholder = Config.PLACEHOLDER_MSG.NEW_USER;

    this.platform.ready().then(() => {
      this.notiService
        .init(this.navCtrl)
        .then(data => {
          console.log("login : OneSignal is Starting");
        })
        .catch(err => {
          console.warn("login : OneSignal Service Error", err);
        });
    });
  }

  ionViewDidEnter() {
    this.menu.swipeEnable(false);
  }

  ionViewWillLeave() {
    this.menu.swipeEnable(true);
  }

  getDeviceID(dni?) {
    if(this.networkService.isNetworkConnected()){
      dni = dni || this.utils.getActiveUser();
    if (!dni) return;
    this.utils.showLoader();
    try {
      this.notiService
        .init(this.navCtrl)
        .then(data => {
          this.login(dni);
        })
        .catch(err => {
          console.warn("login - getDeviceID : Could not get device ID:", err);
          this.login(dni);
        });
    } catch (err) {
      console.warn("login - getDeviceID : Cordova not available.");
      this.login(dni);
    }
    }
    else{
      this.toastService.hideToast();
      this.toastService.showToast(Config.MSG.DISCONNECTED,0);
    }

  }

  login(dni) {
    if (this.loginService.isNewUser(dni)) {
      var titular = this.utils.getTitular();
        //En caso de que exista titular, se avisa de la eliminacion del usuario anterior.
      if (titular && !this.utils.getActiveUser()) {
        var message = Config.MSG.TITULAR_EXIST_INFO.replace("{}", titular);
        let alert = this.alertService.showOptionAlert(Config.TITLE.WARNING_TITLE, message, Config.ALERT_OPTIONS.SI, Config.ALERT_OPTIONS.NO,Config.ALERT_CLASS.ERROR_CSS);
        alert.onDidDismiss(res => {
          if (res != false) {
            //Si contesta que si al Reemplazar titular
            this.checkDNI(dni,this.newMember)
          } else {
            this.utils.hideLoader();
          }
        });
        alert.present();
      }else {//No hay titular
        this.checkDNI(dni,this.newMember)
      }
    } else {
      this.utils.hideLoader();
      if (this.newMember)
        return this.alertService.showAlert(
          Config.MSG.SORRY,
          Config.MSG.ADD_USER_ERROR,
          Config.ALERT_CLASS.ERROR_CSS
        );
      this.loginService.login(dni);
      this.navCtrl.setRoot(HomePage);
    }
  }


  checkDNI(dni,newMember){
    this.authService.checkDNI({ dni }).subscribe(
      data => {
        console.log("login - checkDNI")
        this.utils.hideLoader();
        this.navCtrl.setRoot(
          RegisterPage,
          { data, dni, newMember },
          { animate: true, direction: "back" }
        );
      },
      error => {
        console.log('login - Error: ',error);
        this.utils.hideLoader();
      }
    );
  }

  nextPhoneNumber(){
     this.telefono = this.dataService.nextPhoneNumber();
  }
  closeAllOverlays(){
    this.alertService.hideAlert();
  }

  transitionLogin() {
    console.log("add class");
  }
}
