import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SaContactoPage } from './sa-contacto';

@NgModule({
  declarations: [
    SaContactoPage,
  ],
  imports: [
    IonicPageModule.forChild(SaContactoPage),
  ],
})
export class SaContactoPageModule {}
