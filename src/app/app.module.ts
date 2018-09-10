import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FormsModule } from '@angular/forms'
import { Device } from '@ionic-native/device';

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
import { SolicitudVcPage } from '../pages/solicitud-vc/solicitud-vc'
import { SociosPage } from '../pages/socios/socios';
import { VideoconsultaMessagePage } from './../pages/videoconsulta-message/videoconsulta-message';
import { NavigatorPage } from './../pages/navigator/navigator';
import { FooterPage } from './../pages/footer/footer';


// services
import { AuthService } from '../providers/auth.service'
import { DataService } from '../providers/data.service'
import { LoginService } from "../providers/login.service";
import { NotificationsService } from '../providers/notifications.service'
import { Utils } from '../providers/utils'
import { Tokbox } from '../providers/tokbox'
import { NetworkService } from './../providers/network.service';
import { ToastService } from './../providers/toast.service';
import { MinimizeService } from './../providers/minimize.service';
import { ModalService } from '../providers/modal.service';
import { AlertService } from './../providers/alert.service';
import { ImageService } from './../providers/image.service';
import { GroupedNotificationService } from './../providers/grouped.notificacion.service';
import { AlertBuilder } from './../providers/builders/alert.builder';
import { VideoConsultaService } from './../providers/video.consulta.service';



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
    SociosPage,
    SolicitudVcPage,
    VideoconsultaMessagePage, 
    NavigatorPage,
    FooterPage,
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
    SociosPage,
    SolicitudVcPage,
    VideoconsultaMessagePage, 
    NavigatorPage,
    FooterPage,
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
    Device,
    StatusBar,
    SplashScreen,
    OneSignal,
    Network,
    AndroidFullScreen,
    AuthService,
    LoginService,
    DataService,
    NotificationsService,
    Utils,
    Tokbox,
    NetworkService,
    ToastService,  
    MinimizeService,
    ModalService,
    AlertService,
    ImageService,
    GroupedNotificationService,
    AlertBuilder,
    VideoConsultaService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]

})

export class AppModule {}
