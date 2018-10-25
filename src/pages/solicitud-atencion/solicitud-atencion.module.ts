import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SolicitudAtencionPage } from './solicitud-atencion';

@NgModule({
  declarations: [
    SolicitudAtencionPage,
  ],
  imports: [
    IonicPageModule.forChild(SolicitudAtencionPage),
  ],
})
export class SolicitudAtencionPageModule {}
