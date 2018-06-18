import { Injectable } from '@angular/core'

@Injectable()
export class MinimizeService {

    private isPaused: boolean

    public constructor(){
        document.addEventListener("pause", () => {
            this.isPaused = true;
            console.log('paused');
          }, false);
          
          document.addEventListener("resume", () => {
            this.isPaused = false;
            console.log('resume');
          }, false);
    }

    public isMinimized(){
        return this.isPaused;
    }
     
    
}

