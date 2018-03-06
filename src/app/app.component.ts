import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { Platform, Nav, MenuController, IonicApp } from 'ionic-angular'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { Network } from '@ionic-native/network'
//import { AndroidFullScreen } from '@ionic-native/android-full-screen'

import { LoginPage } from '../pages/login/login'
import { HomePage } from '../pages/home/home'
import { DatosPage } from '../pages/datos/datos'
import { HistorialPage } from '../pages/historial/historial'
import { CredencialPage } from '../pages/credencial/credencial'
import { DeletePage } from '../pages/delete/delete'
//import { VideoConsultaPage } from '../pages/videoconsulta/videoconsulta'

import { DataService } from '../providers/data.service'
import { Utils } from '../providers/utils'
import { Config } from '../app/config'


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
      title : 'Mis datos',
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
      title : 'Historial de atención',
      icon : 'ios-folder-outline',
    },
    {
      page : LoginPage,
      title : 'Agregar socio',
      icon : 'ios-add-outline',
      params : {newMember: true}
    },
    /*
    {
      page : VideoConsultaPage,
      title : 'Video Consulta',
      icon : 'ios-videocam-outline',
    }
    */
  ]

  activeUser = {
    dni: '',
    nombre: ''
  }
  otherUsers = []
  viewMembers = false

  private disconnected = false
  private readyToExit = false

  constructor(
    private platform :Platform,
    private statusBar :StatusBar,
    private splashScreen :SplashScreen,
    //private androidFullScreen: AndroidFullScreen,
    private network :Network,
    private ref :ChangeDetectorRef,
    private dataService: DataService,
    private ionicApp :IonicApp,
    private menuCtrl :MenuController,
    private utils :Utils
  ){

    platform.ready().then(_ => {

      splashScreen.hide()

      /*
      this.androidFullScreen.isImmersiveModeSupported()
        .then(_ => this.androidFullScreen.immersiveMode())
        .catch(err => console.log(err))
      */

      this.initBackButtonAction()

      this.network.onDisconnect().subscribe(_ => {
        this.utils.showToast(Config.MSG.DISCONNECTED, 0)
        this.disconnected = true
      })

      this.network.onConnect().subscribe(_ => {
        if (this.disconnected) {
          this.utils.showToast(Config.MSG.RECONNECTED, 2000)
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
        //console.log('Change detected in users:', users)
        if (!this.ref['destroyed']) this.ref.detectChanges()
      })

      dataService.getTelefonos().subscribe()

      dataService.app = this

    })

  }

  goToPage(page, params?, force?) {
    if (!page) return
    let activePage = this.nav.getActive().instance
    if (activePage.constructor == page && !force) return
    this.nav.push(page, params)
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
      else if (this.menuCtrl.isOpen())
        this.menuCtrl.close()
      else if (this.nav.canGoBack())
        this.nav.pop()
      else {
        let whiteListPages = [ LoginPage, HomePage ]
        // if current page is not in whitelistPage then back to login
        if (whiteListPages.indexOf(activePage.constructor) < 0) {
          this.nav.setRoot(LoginPage)
        } else {
          this.utils.showToast(Config.MSG.EXIT, 1500)
          this.readyToExit = true
          setTimeout(() => { this.readyToExit = false }, 1500)
        }
      }
    }, 101);
  }

}
