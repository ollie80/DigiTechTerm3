import * as ex from 'excalibur';

import { loader, Resources } from './resources';
import { Game } from './game';


export class Main {
    public engine = new ex.Engine({
        width: 360,
        height: 600,
        pixelArt: true,  
        backgroundColor: ex.Color.fromHex("#92b2d4"),
        canvasElementId: 'game'
    });

    private game = new Game();
    

    public start(): void {
        this.engine.start(loader).then(() => {
            this.engine.addScene("Game", this.game);
            this.engine.goToScene("Game");
        })
    }


}

