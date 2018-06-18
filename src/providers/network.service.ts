import { Network } from '@ionic-native/network';
import { Injectable } from '@angular/core'

@Injectable()
export class NetworkService {

    public constructor(private network:Network){

    }

    public isNetworkConnected(){
        if(this.network.type != "none")
        return true;
    }
}

