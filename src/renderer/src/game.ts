import * as ex from 'excalibur';

import { Resources } from './resources';
import { Player } from './actors';
import { AStarGrid } from './grid';
import { Layer, PluginObject, TiledMap, TiledResource } from '@excaliburjs/plugin-tiled';
import { Recoverable } from 'repl';
import { getRandom, round, loadGame, saveData, saveGame, createSave } from './support';

export class Game extends ex.Scene {
  public saveId: number;

  public mousePos: ex.Vector = ex.vec(0, 0);
  public globalMousePos = ex.vec(0, 0);
  public mouseDown = false;

  constructor() {
    super();

    this.saveId = 1;

    loadGame(this.saveId);
  }


  onInitialize(engine: ex.Engine<any>): void {
   
  }


  onMouseClick(): void {
  }

  onPreUpdate(engine: ex.Engine<any>, delta: number): void {

  }
}
