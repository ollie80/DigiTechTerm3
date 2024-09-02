import * as ex from "excalibur";
import { Resources } from "./resources";
import "./support";
import { Game } from "./game";
import { GridTile } from "./grid";
import { gameSprites, getRandom, loadGame, moveTowards } from "./support";
import { TweenableActor, Ease } from "./tween";

export class Player extends TweenableActor {
  private path: GridTile[] = [];
  private isMoving = false;
  private speed = 40;
  public fuel = 4;
  public maxFuel = 4;
  public deathTimer = new ex.Timer({ interval: 1000 });
  private animSpeed = 2;
  

  constructor(
    pos: ex.Vector,
    private game: Game
  ) {
    super({
      pos,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red,
      z: 99999,
    });
  
    loadGame(1)
  }

  onInitialize(engine: ex.Engine): void {
    this.game.add(this.deathTimer);

    this.graphics.add(
      "left",
      new ex.Animation({
        width: 16,
        height: 16,
        frames: [
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(0, 0),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(1, 0),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(2, 0),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(3, 0),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(4, 0),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(5, 0),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(6, 0),
            duration: this.animSpeed,
          },
        ],
      })
    );

    this.graphics.add(
      "right",
      new ex.Animation({
        width: 16,
        height: 16,
        frames: [
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(0, 1),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(1, 1),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(2, 1),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(3, 1),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(4, 1),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(5, 1),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(6, 1),
            duration: this.animSpeed,
          },
        ],
      })
    );

    this.graphics.add(
      "down",
      new ex.Animation({
        width: 16,
        height: 16,
        frames: [
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(0, 2),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(1, 2),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(2, 2),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(3, 2),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(4, 2),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(5, 2),
            duration: this.animSpeed,
          },
          {
            graphic: gameSprites.playerSpriteSheet.getSprite(6, 2),
            duration: this.animSpeed,
          },
        ],
      })
    );
    this.graphics.use("right");
  }

  mouseClick() {
    if (this.game.isPlaying) {
      if (!this.isMoving) {
        const startTile = this.game.grid.getTileColliding(this.pos, "main");
        const endTile = this.game.grid.getTileColliding(
          this.game.globalMousePos,
          "main"
        );

        if (startTile && endTile) {
          if (endTile.pos.y < startTile.pos.y) {
            return;
          } else {
            this.path = this.game.pathFinder.findPath(startTile, endTile);
          }

          this.path[0].actor.graphics.hide();
          this.path.splice(0, 1);

          this.startMoving();

          console.log(this.path);
        }
      }
    }
  }

  startMoving() {
    this.isMoving = true;
    this.deathTimer.stop();
  }

  finishMoving() {
    this.isMoving = false;
    this.deathTimer.start();
  }

  move(delta: number) {
    if (this.isMoving) {
      const currTile = this.game.grid.getTileColliding(this.pos, "main");

      if (currTile) {
        if (this.path.length <= 0) {
          this.finishMoving();
        } else {
          const nextTile = this.path[0];
          const direction = nextTile.actor.pos.sub(this.pos).normalize();

          // Determine movement direction
          if (direction.y > 0) {
            this.pos.y += (this.speed * delta) / 1000;
            this.graphics.use("down");
          } else if (direction.x > 0) {
            this.pos.x += (this.speed * delta) / 1000;
            this.graphics.use("right");
          } else if (direction.x < 0) {
            this.pos.x -= (this.speed * delta) / 1000;
            this.graphics.use("left");
          }

          // Check if player has reached the next tile
          if (this.pos.distance(nextTile.actor.pos) < 1) {
            this.path[0].actor.graphics.hide();
            this.path.shift();
            this.fuel -= 1;
            this.game.score += 1;
            
            console.log("here");
          }
        }
      }
    }
  }

  death() {
    if (this.game.isPlaying) {
      if (this.deathTimer.complete) {
        this.kill();
      }

      if (this.fuel <= 0) {
        this.game.gameOver();
        this.path = [];
      }
    }
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.vel = ex.Vector.Zero;
    this.move(delta);
    this.death();
  }
}

export class CameraBar extends ex.Actor {
  constructor(
    private game: Game
  ) {
    super();

    this.pos = ex.vec(3.5 * 16, this.game.player.pos.y);
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.pos.y = this.game.player.pos.y;
  }
}

export class Rubbish extends ex.Actor {
  constructor(
    pos: ex.Vector,
    private game: Game
  ) {
    super({ width: 6, height: 6, pos: pos, z: 999999 });
    this.graphics.use(
      ex.Sprite.from(Resources[`rubbish${getRandom(1, 3) - 1}`])
    );
  }

  onInitialize(engine: ex.Engine): void {}

  onCollisionStart(
    self: ex.Collider,
    other: ex.Collider,
    side: ex.Side,
    contact: ex.CollisionContact
  ): void {
    if (other.owner instanceof Player) {
      other.owner.fuel = other.owner.maxFuel;
      this.death();
      this.game.spawnRubbish();
    }
  }

  death() {
    this.kill();
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {}
}

export class TileHighlight extends ex.Actor {
  constructor(private game: Game) {
    super({ width: 16, height: 16, z: 9999999 });
    this.graphics.use(ex.Sprite.from(Resources.highlight));
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    let tile = this.game.grid.getTileColliding(
      this.game.globalMousePos,
      "main"
    );
    if (tile) {
      this.pos = tile.actor.pos;
    }
  }
}
