import * as ex from "excalibur";

import { CameraBar, Player, Rubbish, TileHighlight } from "./actors";
import { Grid, GridTile, PathFinder } from "./grid";

import { loadGame, saveData, gameSprites } from "./support";
import { Resources } from "./resources";
import { Recoverable } from "repl";

export class Game extends ex.Scene {
  public saveId: number;

  public mousePos: ex.Vector = ex.vec(0, 0);
  public globalMousePos = ex.vec(0, 0);
  public mouseDown = false;

  public pathFinder: PathFinder;
  public player: Player;
  private cameraBar: CameraBar;
  public grid: Grid;
  public score: number = 0;
  public isPlaying = false;

  public sounds: ex.Sound[] = [];

  constructor() {
    super();

    this.grid = new Grid(this, {
      size: ex.vec(7, 100),
      layers: ["main"],
      pos: ex.vec(0, 60),
      tileSize: 16,
    });

    this.generateGrid();

    this.pathFinder = new PathFinder(this.grid, "main");

    this.player = new Player(ex.vec(3 * 16, -1), this);

    this.cameraBar = new CameraBar(this);

    this.saveId = 1;

    loadGame(this.saveId);
  }

  setupUI() {
    const highscore = document.getElementById("highscore");
    if (highscore) {
      highscore.innerText = `Highscore: ${saveData.highscore.toString()}`;
    }

    const menu = document.getElementById("menu");

    menu?.classList.remove("hide");

    const menuPlayButton = document.getElementById("menu-play");
    const menuQuitButton = document.getElementById("menu-quit");
    console.log(menuPlayButton);
    if (menuPlayButton != null) {
      menuPlayButton.onclick = () => this.startGame();
    }

    if (menuQuitButton != null) {
      menuQuitButton.onclick = () => this.quit();
    }

    const deathPlayButton = document.getElementById("death-play");
    const deathQuitButton = document.getElementById("death-quit");

    if (deathPlayButton != null) {
      deathPlayButton.onclick = () => this.startGame();
    }

    if (deathQuitButton != null) {
      deathQuitButton.onclick = () => this.quit();
    }
  }

  startGame() {
    const menu = document.getElementById("menu");

    menu?.classList.add("hide");

    const gameover = document.getElementById("death");

    gameover?.classList.add("hide");

    const gameUI = document.getElementById("gameplay");

    gameUI?.classList.remove("hide");

    for (let actor of this.actors) {
      if (actor instanceof TileHighlight) {
        actor.kill();
      }
      if (actor instanceof Player) {
        actor.kill();
      }
    }

    let layer = this.grid.getLayer('main');
    if (layer) {
      for (let tile of layer.tiles) {
        tile.actor.kill()   
      }
      layer.tiles = [];
    }

    this.generateGrid()

    this.player = new Player(ex.vec(3 * 16, 0), this);
    this.add(this.player);

    this.add(new TileHighlight(this));
    this.spawnRubbish();




    this.isPlaying = true;
  }

  gameOver() {
    if (this.score > saveData.highscore) {
      saveData.highscore = this.score;
    }

    this.isPlaying = false;

    const gameUI = document.getElementById("gameplay");

    gameUI?.classList.add("hide");

    const gameover = document.getElementById("death");

    gameover?.classList.remove("hide");
  }

  quit() {}

  setScores() {
    const score = document.getElementById("score");
    if (score) {
      score.innerText = `Score: ${this.score}`;
    }

    const highscore = document.getElementById("highscore");
    if (highscore) {
      highscore.innerText = `Highscore: ${saveData.highscore.toString()}`;
    }
  }

  generateGrid() {
    //grass layer
    for (let j = 0; j <= this.grid.size.x; j++) {
      this.grid.createTile(
        {
          pos: ex.vec(j, 0),
          sprite: gameSprites.mapSpriteSheet.getSprite(
            Math.round(Math.random()),
            0
          ),
        },
        "main"
      );
    }

    //dirt layer
    for (let i = 1; i <= Math.round(this.grid.size.y * 0.5); i++) {
      for (let j = 0; j <= this.grid.size.x; j++) {
        this.grid.createTile(
          {
            pos: ex.vec(j, i),
            sprite: gameSprites.mapSpriteSheet.getSprite(
              Math.round(Math.random()),
              Math.round(Math.random()) + 1
            ),
          },
          "main"
        );
      }
    }

    // transition layer
    for (let j = 0; j <= this.grid.size.x; j++) {
      this.grid.createTile(
        {
          pos: ex.vec(j, Math.round(this.grid.size.y * 0.5) + 1),
          sprite: gameSprites.mapSpriteSheet.getSprite(
            2 + Math.round(Math.random()),
            0
          ),
        },
        "main"
      );
    }

    // rock layer
    for (
      let i = 1 + Math.round(this.grid.size.y * 0.5);
      i <= this.grid.size.y;
      i++
    ) {
      for (let j = 0; j <= this.grid.size.x; j++) {
        this.grid.createTile(
          {
            pos: ex.vec(j, i),
            sprite: gameSprites.mapSpriteSheet.getSprite(
              2 + Math.round(Math.random()),
              1 + Math.round(Math.random())
            ),
          },
          "main"
        );
      }
    }
  }

  spawnRubbish() {
    const closeRubbish: GridTile[] = [];
    const farRubbish: GridTile[] = [];
    const maxCloseDistance = 3.5 * this.grid.tileSize;
    const maxFarDistance = 5 * this.grid.tileSize;
    const layer = this.grid.getLayer("main");

    //kill all rubbish
    for (let actor of this.actors) {
      if (actor instanceof Rubbish) {
        actor.death();
      }
    }

    // Get all grid tiles that are far enough and close enough

    if (layer) {
      for (let tile of layer.tiles) {
        if (tile) {
          const distance =
            Math.abs(tile.actor.pos.y - this.player.pos.y) +
            Math.abs(tile.actor.pos.x - this.player.pos.x);

          if (tile.actor.pos.y > this.player.pos.y) {
            if (
              distance <= maxCloseDistance &&
              distance > 2.5 * this.grid.tileSize
            ) {
              closeRubbish.push(tile);
            } else if (
              distance > maxCloseDistance &&
              distance < maxFarDistance
            ) {
              farRubbish.push(tile);
            }
          }
        }
      }
    }

    // Ensure we have at least one close rubbish and one far rubbish
    if (closeRubbish.length === 0 || farRubbish.length === 0) {
      throw new Error("Insufficient tiles for spawning rubbish.");
    }

    // Randomly select one close rubbish and 1-2 far rubbish
    const selectedRubbish: GridTile[] = [];
    selectedRubbish.push(
      closeRubbish[Math.floor(Math.random() * closeRubbish.length)]
    );

    const numberOfFarRubbish = Math.floor(Math.random() * 2) + 1; // 1 or 2 far rubbish
    for (let i = 0; i < numberOfFarRubbish; i++) {
      selectedRubbish.push(
        farRubbish[Math.floor(Math.random() * farRubbish.length)]
      );
    }

    // Return the selected rubbish positions
    for (let rubbishTile of selectedRubbish) {
      this.add(new Rubbish(rubbishTile.actor.pos, this));
    }
  }

  onInitialize(): void {
    this.camera.zoom = 3;

    this.setupUI();

    this.add(this.player);
    this.add(this.cameraBar);
    this.camera.pos = ex.vec(3.5 * 16, 0);
    this.camera.strategy.elasticToActor(this.cameraBar, 0.5, 0.5);

    document.getElementById("game")?.addEventListener("mousemove", (event) => {
      this.mousePos = ex.vec(event.x, event.y);
      this.globalMousePos = ex.vec(
        this.mousePos.x / this.camera.zoom +
          (this.camera.pos.x - window.innerWidth / this.camera.zoom / 2),
        this.mousePos.y / this.camera.zoom +
          (this.camera.pos.y - window.innerHeight / this.camera.zoom / 2)
      );
    });

    document.getElementById("game")?.addEventListener("mousedown", () => {
      this.mouseDown = true;
    });

    document.getElementById("game")?.addEventListener("mouseup", () => {
      this.mouseDown = false;
    });

    document.getElementById("game")?.addEventListener("click", (ev) => {
      // update mouse position

      this.mousePos = ex.vec(ev.x, ev.y);
      this.globalMousePos = ex.vec(
        this.mousePos.x / this.camera.zoom +
          (this.camera.pos.x - window.innerWidth / this.camera.zoom / 2),
        this.mousePos.y / this.camera.zoom +
          (this.camera.pos.y - window.innerHeight / this.camera.zoom / 2)
      );

      this.onMouseClick();
    });
  }
  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.setScores()
  }

  onMouseClick(): void {
    this.player.mouseClick();
  }
}
