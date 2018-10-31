import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaConsultaPage } from './sa-consulta';

@NgModule({
  declarations: [
    SaConsultaPage,
  ],
  imports: [
    IonicPageModule.forChild(SaConsultaPage),
  ],
})
export class SaConsultaPageModule {}
