import { Injectable } from '@angular/core'
import { Http } from '@angular/http'


const SERVER_BASE_URL = 'https://cdt-tokbox.herokuapp.com'

declare var OT :any
declare var Cordova :any

@Injectable()
export class Tokbox {

  private styleProps = {
    buttonDisplayMode: 'off',
    audioLevelDisplayMode: 'off',
    videoDisabledDisplayMode: 'on',
  }
  public controlHandlers = {
    hangup : () => {
      console.warn('handler not ready yet')
    },
    toggleCam : bool => {
      console.warn('handler not ready yet')
    },
    toggleMic : bool => {
      console.warn('handler not ready yet')
    },
  }
  private participants = []

  public VC

  constructor(private http :Http){}


  public getCredentials(params) {
    const { cid, isSafari } = params

    this.http.post(SERVER_BASE_URL + '/room/' + cid, { isSafari } ).subscribe(
      res => {
        if (!res.ok) return this.handleError('Network response was not ok',  'Get credentials')
        this.initService(res.json())
      },
      err => this.handleError(err, 'Get credentials')
    )
  }


  initService(params) {
    const { apiKey, sessionId, token } = params

    const session = OT.initSession(apiKey, sessionId)

    const publisher = OT.initPublisher('local',
      {
        insertMode : 'append',
        style : this.styleProps,
        //resolution : '640x480',
        audioBitrate : 20000,
        fitMode : 'contain',
        width : 640,
        height : 480,
      },
      err => {
        if (err) return this.handleError(err, 'Init')
        console.log('created publisher')
    })

    // Populate control handlers
    if (session && publisher) this.controlHandlers = {
      hangup : () => {
        this.participants = []
        session.disconnect()
      },
      toggleCam : bool => {
        publisher.publishVideo(bool)
      },
      toggleMic : bool => {
        publisher.publishAudio(bool)
      },
    }

    session
    .on('streamCreated', event => {
      // Add participants
      if (this.participants.length >= 2) {
        console.warn('UI is full, ignoring new stream')
        return
      }
      const newguy = session.subscribe(event.stream,
        this.participants.length ? 'extra' : 'fullvideo', // DOM el id
        {
          insertMode: 'append',
          style: this.styleProps,
        }
      )
      this.participants.push(newguy)
      console.info('Added participant:', newguy)
      console.info('Remote participants:', this.participants)
    })
    .on('streamDestroyed', event => {
      // Remove participants
      const deadguy = this.participants.find( p => p.streamId == event.stream.streamId )
      this.participants = this.participants.filter(p => p.streamId != event.stream.streamId)
      console.info('Removed participant:', deadguy)
      console.info('Remote participants:', this.participants)
    })
    .on('sessionConnected', event => {
      console.log('Connected to session! :D')
    })
    .on('sessionDisconnected', event => {
      console.log('Hasta la vista, baby')
    })
    // Connect to session
    .connect(token, err => {
      if (err) return this.handleError(err, 'Connect')
      console.log('session connected, publishing')
      session.publish(publisher)
      this.VC.startCall()
      setTimeout(OT.updateViews, 1000)
    })
    
  }

  public getHandlers() {
    return this.controlHandlers
  }

  public getParticipants() {
    return this.participants
  }

  handleError(error, prefix?) {
    if (!error) return
    let msg = error.message
    if (prefix) msg = prefix + ': ' + msg
    console.error(msg)
    this.VC.showError()
  }

}