import { Config } from './config';
import { AlertService } from './../providers/alert.service';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { Platform, Nav, MenuController, IonicApp } from 'ionic-angular'
import { Network } from '@ionic-native/network'
import { SplashScreen } from '@ionic-native/splash-screen'
import { LoginPage } from '../pages/login/login'
import { HomePage } from '../pages/home/home'
import { DatosPage } from '../pages/datos/datos'
import { HistorialPage } from '../pages/historial/historial'
import { CredencialPage } from '../pages/credencial/credencial'
import { DeletePage } from '../pages/delete/delete'
import { SociosPage } from '../pages/socios/socios'
import { DataService } from '../providers/data.service'
import { Utils } from '../providers/utils'
import { ToastService } from '../providers/toast.service';
import { SolicitudVcPage } from './../pages/solicitud-vc/solicitud-vc';
import { SolicitudAtencionPage } from './../pages/solicitud-atencion/solicitud-atencion';


@Component({
  templateUrl : 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav :Nav
  rootPage :any = LoginPage
  pages = [
    {
      page : HomePage,
      title : 'Inicio',
      icon : 'ios-home-outline',
    },
    {
      page : DatosPage,
      title : 'Mis Datos',
      icon : 'ios-person-outline',
    },
    {
      page : CredencialPage,
      title : 'Credencial',
      icon : 'ios-card',
      params : {}
    },
    {
      page : HistorialPage,
      title : 'Historial de Atención',
      icon : 'ios-folder-outline',
    },
    {
      page : SociosPage,
      title : 'Solicitar Video Consulta',
      icon : 'ios-videocam-outline'
    },
    {
      page : SolicitudAtencionPage,
      title : 'Solicitud de Atención',
      icon : 'ios-briefcase-outline'
    },
    {
      page : LoginPage,
      title : 'Agregar socio',
      icon : 'ios-add-outline',
      params : {newMember: true}
    }
  ]


  activeUser = {
    dni: '',
    nombre: ''
  }
  otherUsers = []
  viewMembers = false

  private disconnected = false;
  private readyToExit = false;


  constructor(
    private platform :Platform,
    private splashScreen :SplashScreen,
    private network :Network,
    private ref :ChangeDetectorRef,
    private dataService: DataService,
    private ionicApp :IonicApp,
    private menuCtrl :MenuController,
    private utils :Utils,
    private toastService : ToastService,
    private alertService : AlertService
  ){

    platform.ready().then(_ => {

      splashScreen.hide();

      this.initBackButtonAction();

      this.network.onDisconnect().subscribe(_ => {
        //si esta desconectado se muestra una unica vez
        if(!this.disconnected){
        this.toastService.showToast(Config.MSG.DISCONNECTED, 0)
        this.disconnected = true
        }
      })

      this.network.onConnect().subscribe(_ => {
        //cuando se conecta oculto el toast anterior y muestro un nuevo toast de conexion restablecida.
        this.toastService.hideToast();
        if (this.disconnected) {
          this.toastService.showToast(Config.MSG.RECONNECTED, 2000)
          this.disconnected = false
        }
        // We just got a connection but we need to wait briefly
        // before we determine the connection type. Might need to wait
        // prior to doing any api requests as well.
        setTimeout(_ => {


          console.log('Network type:', this.network.type)
        }, 3000)
      })

      dataService.usersChange.subscribe(users => {
        this.activeUser = users.find(e => e.active)
        this.otherUsers = users.filter(e => !e.active)
        if (!this.ref['destroyed']) this.ref.detectChanges()
      })
      dataService.app = this
      this.viewMembers = false;

    })

  }

private goToPage(page, params?, force?) {
    if (!page) return;
    if ( page.pageName && page.pageName == "SociosPage" ){
      console.log(">>> Entra en Page: "+ page.pageName);
      //agrego el loader porque el servicio tarda bastante.
      this.utils.showLoader();
      this.isVCAvailable(page, params);
    }else{
      this.navigatePage(page, params, force);
    }
  }


private isVCAvailable(page,params){
    //Un solo socio
    let sociosDNI = this.dataService.restoreUsers();
    if(sociosDNI.length == 1){
      this.oneUserVC(sociosDNI,params);
    }
    //mas de un socio
    else{
      this.multipleUserVC(page,params);
    }
  }


  validateVCResponse(responseValidateVC,socioActual) {
    //Se muestra un mensaje diferente dependiendo la respuesta del servicio validar VC
    let response = this.dataService.getResponseData(responseValidateVC);
    if (response.estadoVC == "Activo") {
        let telefono = {prefijo: response.telefonoCaracteristica, numero: response.telefonoNumero}
        let params = { socio: socioActual, email: response.email, tel : telefono};
        this.navigatePage(SolicitudVcPage, params);
    }
    else {
        this.utils.hideLoader();
        this.alertService.showAlert(Config.TITLE.VIDEO_CALL_TITLE, response.Mensaje,Config.ALERT_CLASS.OK_CSS);
        //Solo muestra ok y vuelve al home
        this.navigatePage(HomePage);
    }
}


  private navigatePage(page, params?, force?){
    let activePage = this.nav.getActive().instance;
    if (activePage.constructor == page && !force) return;
    this.nav.push(page, params);

  }


  goAddMember() {
    this.nav.push(LoginPage, {newMember: true})
    this.toggleView()
  }

  goDeleteMember() {
    this.nav.push(DeletePage)
    this.toggleView()
  }

  setActiveUser(dni) {
    this.utils.setActiveUser(dni)
    this.nav.setRoot(HomePage)
    this.toggleView()
  }

  public logout() {
    this.utils.setActiveUser(null)
    this.utils.setItem(Config.KEY.EXPIRES, 0)
    this.nav.setRoot(LoginPage)
    this.viewMembers = false;
  }

  public closeMenu(){
    this.viewMembers = false;
  }

  public openMenu(){
    this.activeUser.dni = this.utils.getActiveUser();
    let user = this.dataService.restoreMisDatos(this.utils.getActiveUser());
    this.activeUser.nombre = user.nombre + " " + user.apellido;
    this.ref.detectChanges();
  }

  toggleView() {
    if (this.otherUsers.length) this.viewMembers = !this.viewMembers
  }

  initBackButtonAction() {
    this.platform.registerBackButtonAction(() => {
      if (this.readyToExit)
        return this.platform.exitApp()

      let activePortal = this.ionicApp._loadingPortal.getActive() ||
        this.ionicApp._modalPortal.getActive() ||
        this.ionicApp._toastPortal.getActive() ||
        this.ionicApp._overlayPortal.getActive()

      let activePage = this.nav.getActive().instance

      if ('function' == typeof activePage.backButtonAction )
        activePage.backButtonAction()
      else if (activePortal) {
        activePortal.dismiss()
        activePortal.onDidDismiss(() => { })
      }
      else if (this.menuCtrl.isOpen()){
        this.menuCtrl.close()
        this.viewMembers = false;
      }
      else if (this.nav.canGoBack())
        this.nav.pop()
      else {
        let whiteListPages = [ LoginPage, HomePage ]
        // if current page is not in whitelistPage then back to login
        if (whiteListPages.indexOf(activePage.constructor) < 0) {
          this.nav.setRoot(LoginPage)
        } else {
          this.toastService.showToast(Config.MSG.EXIT, 1500)
          this.readyToExit = true
          setTimeout(() => { this.readyToExit = false }, 1500)
        }
      }
    }, 101);
  }

 oneUserVC(sociosDNI,params){
    let socioActual = this.dataService.restoreMisDatos(sociosDNI[0]);
    this.dataService.validarVC(socioActual.dni, "NO").subscribe(
      data =>{
      this.validateVCResponse(data,socioActual);
      },
      err=>{
      this.utils.hideLoader();
      console.log('Erro al validateAvailableVC:', err);
      let message = Config.MSG.SOLICITUD_VC_ERROR;
      this.alertService.showAlert(Config.TITLE.WARNING_TITLE, message,Config.ALERT_CLASS.ERROR_CSS);
      this.navigatePage(HomePage, params, false);
      })
  }

  multipleUserVC(page,params){
    this.dataService.validateAvailableVC(this.activeUser.dni).subscribe(
      res=>{
            this.utils.hideLoader();
            console.log("validateAvailableVC - res.estadoVC: ", res.estadoVC);
            if(res.estadoVC =="Inactivo"){
              let message = res.Mensaje;
              this.alertService.showAlert(Config.TITLE.WARNING_TITLE, message,Config.ALERT_CLASS.ERROR_CSS);
              this.utils.hideLoader();
              this.navigatePage(HomePage, params, false);
            }
            else{
                  this.navigatePage(page, params, false);
              }
      },
      err=>{
            this.utils.hideLoader();
            console.log('Erro al validateAvailableVC:', err);
            let message = Config.MSG.SOLICITUD_VC_ERROR;
            this.alertService.showAlert(Config.TITLE.WARNING_TITLE, message,Config.ALERT_CLASS.ERROR_CSS);
            this.navigatePage(HomePage, params, false);
      })
  }
}
