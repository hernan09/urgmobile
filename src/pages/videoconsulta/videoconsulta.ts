import { VideoconsultaMessagePage } from './../videoconsulta-message/videoconsulta-message';
import { DataService } from './../../providers/data.service';
import { Component, ChangeDetectorRef } from '@angular/core'
import { Http } from '@angular/http'
import { NavController, NavParams } from 'ionic-angular'
import { HomePage } from '../home/home'
import { Utils } from '../../providers/utils'
import { Tokbox } from '../../providers/tokbox'
import { ToastService } from '../../providers/toast.service';
import { Config } from './../../app/config';


const RELOAD_DELAY = 3;
const {VC_SERVER_URL } = Config;


@Component({
  selector: 'page-videoconsulta',
  templateUrl: 'videoconsulta.html',
})
export class VideoConsultaPage {

  private cid
  private dni
  show = 'start'
  mic = true
  cam = true
  private readyToExit = false
  isBlocked = false;

  constructor(
    public navCtrl :NavController,
    public navParams :NavParams,
    public utils :Utils,
    private http :Http,
    private provider :Tokbox,
    private ref: ChangeDetectorRef,
    private toastService : ToastService,
    private dataService : DataService,
  ) {
    this.utils.showLoader();
    this.cid = navParams.get('cid') || utils.getItem('cid') || 'test'
    this.dni = navParams.get('dni') || utils.getItem('dni') || '12345678'

    this.utils.setItem('cid', this.cid)
    provider.VC = this
    this.checkCid()
  }


  checkCid() {
    this.utils.showLoader()
    return this.http.get(VC_SERVER_URL + '/cid/' + this.cid).subscribe(
      data => {
        // if get succeeds, cid is blacklisted
        console.log('Conference is no longer available')
        this.show = 'unavailable'
        this.utils.hideLoader()        
        setTimeout(this.exit, 2000)
      },
      err => {
        // if get yields a 404, cid is available
        // for any other error, allow access to conf anyway
        this.dataService.saveCID(this.cid,this.dni);
        this.provider.getCredentials({ cid : this.cid, isSafari : 0 })
      }
    )
  }


  private unavailableCId(){
    // if get succeeds, cid is blacklisted
    console.log('Conference is no longer available');
    this.show = 'unavailable';
    this.utils.hideLoader();
  }

  blockCid() {
    return this.http.post(VC_SERVER_URL + '/cid', { cid : parseInt(this.cid) } ).subscribe(
      data => {
        console.log('Conference blocked')
      },
      err => {
        console.log('Could not block conference')
      }
    )
  }


  public startCall() {
    this.show = 'video'
    this.utils.hideLoader()
  }


  public backButtonAction() {
    if (this.readyToExit) {
      this.toastService.hideToast()
      this.hangup()
    }
    else {
      this.toastService.showToast(Config.MSG.EXIT_VC, 1500)
      this.readyToExit = true
      setTimeout(_ => { this.readyToExit = false }, 1500)
    }
  }


  public showError() {
    this.show = 'error'
    this.utils.hideLoader()
    setTimeout(_ => this.navCtrl.setRoot(VideoConsultaPage), RELOAD_DELAY * 1000)
  }


  toggleCam() {
    this.cam = !this.cam
    this.provider.controlHandlers.toggleCam( this.cam )
    this.ref.detectChanges()
  }

  toggleMic() {
    this.mic = !this.mic
    this.provider.controlHandlers.toggleMic( this.mic )
    this.ref.detectChanges()
  }

  hangup() {
    console.log('hanging up')
    this.provider.controlHandlers.hangup()
    this.exit()
  }

  exit() {
    this.utils.delItem('cid')
    this.navCtrl.setRoot(HomePage)
  }

goHome(vcInstance:any){
  vcInstance.navCtrl.setRoot(VideoconsultaMessagePage);

}

}
