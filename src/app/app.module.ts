import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FormsModule } from '@angular/forms'

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'

// ionic plugins
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar'
import { OneSignal } from '@ionic-native/onesignal'
import { Network } from '@ionic-native/network'
import { AndroidFullScreen } from '@ionic-native/android-full-screen'

import { MyApp } from './app.component'

// components
import { CheckerComponent } from '../components/checker'

// pages
import { LoginPage } from '../pages/login/login'
import { RegisterPage } from '../pages/register/register'
import { TycsPage } from '../pages/tycs/tycs'
import { HomePage } from '../pages/home/home'
import { DatosPage } from '../pages/datos/datos'
import { HistorialPage } from '../pages/historial/historial'
import { HistorialDetallePage } from '../pages/historial-detalle/historial-detalle'
import { CredencialPage } from '../pages/credencial/credencial'
import { FamiliaPage } from '../pages/familia/familia'
import { DeletePage } from '../pages/delete/delete'
import { VideoConsultaPage } from '../pages/videoconsulta/videoconsulta'

// services
import { AuthService } from '../providers/auth.service'
import { DataService } from '../providers/data.service'
import { NotificationsService } from '../providers/notifications.service'
import { Utils } from '../providers/utils'
import { Tokbox } from '../providers/tokbox'


@NgModule({

  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    TycsPage,
    HomePage,
    DatosPage,
    HistorialPage,
    HistorialDetallePage,
    CredencialPage,
    FamiliaPage,
    DeletePage,
    VideoConsultaPage,
    CheckerComponent,
  ],
  
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    TycsPage,
    HomePage,
    DatosPage,
    HistorialPage,
    HistorialDetallePage,
    CredencialPage,
    FamiliaPage,
    DeletePage,
    VideoConsultaPage,
    CheckerComponent,
  ],

  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    FormsModule,
    HttpModule,
  ],

  bootstrap: [IonicApp],

  providers: [
    StatusBar,
    SplashScreen,
    OneSignal,
    Network,
    AndroidFullScreen,
    AuthService,
    DataService,
    NotificationsService,
    Utils,
    Tokbox,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]

})

export class AppModule {}
