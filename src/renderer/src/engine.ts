import * as ex from 'excalibur';

import { loader, Resources } from './resources';
import { Game } from './game';


export class Main {
    public engine = new ex.Engine({
        displayMode: ex.DisplayMode.FitScreen,
        

        pixelArt: true,  
        backgroundColor: ex.Color.fromHex("#99c5de")
    });

    private game = new Game();
    

    public start(): void {
        this.engine.start(loader).then(() => {
            this.engine.addScene("Game", this.game);
            this.engine.goToScene("Game");              
        })
    }


}

