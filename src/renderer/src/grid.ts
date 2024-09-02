import * as ex from "excalibur";
import { start } from "repl";
import { getRandom } from "./support";
import { Resources } from "./resources";
import { TiledLayerComponent } from "@excaliburjs/plugin-tiled/dist/src/deprecated";
import { Layer, TiledMap } from "@excaliburjs/plugin-tiled";
import { AsyncResource } from "async_hooks";
import { Game } from "./game";

export type GridArgs = {
  pos: ex.Vector; //topleft of grid
  size: ex.Vector; //size in tiles
  layers: string[];
  tileSize: number;
};

export type GridTileArgs = {
  pos: ex.Vector; //pos in grid, not world pos
  sprite: ex.Sprite;
};

export type GridObjectArgs = {
  pos: ex.Vector;
  sprite: ex.Sprite;
  size: ex.Vector;
};

export type GridLayerArgs = {
  name: string;
  isMapped?: boolean;
};

export class GridTile {
  public actor: ex.Actor;
  public pos: ex.Vector;
  private sprite: ex.Sprite;

  constructor(
    private grid: Grid,
    private layer: string,
    args: GridTileArgs
  ) {
    this.pos = args.pos;
    this.sprite = args.sprite;
    this.actor = new ex.Actor({
      width: 16,
      height: 16,
      pos: ex.vec(
        this.pos.x * this.grid.tileSize,
        this.pos.y * this.grid.tileSize
      ),
      collisionType: ex.CollisionType.Passive
    });
    this.actor.graphics.use(this.sprite);
    this.pos = args.pos;
    this.grid.game.add(this.actor);
  }
}

export class GridObject {
  public actor: ex.Actor;
  public pos: ex.Vector;
  private sprite: ex.Sprite;
  private size: ex.Vector;

  constructor(
    private grid: Grid,
    private layer: string,
    args: GridObjectArgs
  ) {
    this.sprite = args.sprite;
    this.size = args.size;
    this.pos = args.pos;
    this.actor = new ex.Actor({
      pos: ex.vec(
        this.pos.x * this.grid.tileSize,
        this.pos.y * this.grid.tileSize
      ),
      z: 99999999,
    });
    this.actor.graphics.use(this.sprite);
    this.grid.game.add(this.actor);
  }
}

export class GridLayer {
  public tiles: GridTile[] = [];
  public objects: GridObject[] = [];
  public name: string;

  constructor(
    private grid: Grid,
    args: GridLayerArgs
  ) {
    this.name = args.name;
    if (args.isMapped === true) {
    }
  }
}

export class Grid {
  public layers: GridLayer[] = [];
  public pos: ex.Vector;
  public size: ex.Vector;
  public tileSize: number;

  constructor(
    public game: Game,
    args: GridArgs
  ) {
    for (let layer of args.layers) {
      this.layers.push(new GridLayer(this, { name: layer }));
    }
    this.size = args.size;
    this.pos = args.pos;
    this.tileSize = args.tileSize;
  }

  public createTile(tileArgs: GridTileArgs, layerName: string) {
    let layer = this.getLayer(layerName);
    layer?.tiles.push(new GridTile(this, layerName, tileArgs));
  }

  public createObject(objectArgs: GridObjectArgs, layerName: string) {
    let layer = this.getLayer(layerName);
    layer?.objects.push(new GridObject(this, layerName, objectArgs));
  }

  public worldToGridPos(pos: ex.Vector): ex.Vector {
    return ex.vec(
      Math.round(pos.x / this.tileSize),
      Math.round(pos.y / this.tileSize)
    );
  }


  public gridToWorldPos(pos: ex.Vector): ex.Vector {
    return ex.vec(pos.x * this.tileSize, pos.y * this.tileSize);
  }

  getTileColliding(pos: ex.Vector, layerName: string): GridTile | undefined {
    let layer = this.getLayer(layerName);
    if (layer) {
        for (let tile of layer.tiles) {

            if (tile.actor.collider.bounds.contains(pos)) {

              return tile;
            }
        }
    }
    return undefined;
}


  public getTileAtPos(pos: ex.Vector, layerName: string): GridTile | undefined {
    let layer = this.getLayer(layerName);
    if (layer) {
      for (let tile of layer.tiles) {
        // Compare the x and y coordinates directly
        if (tile.pos.x === pos.x && tile.pos.y === pos.y) {
          return tile;
        }
      }
    }
    return undefined;
  }

  public objectCollidingWithPos(pos: ex.Vector, layerName: string): boolean {
    let layer = this.getLayer(layerName);
    if (layer) {
      for (let object of layer.objects) {
        if (object.actor.collider.bounds.contains(pos)) {
          return true;
        }
      }
    } else {
      return false;
    }

    return false;
  }

  public getObjectAtPos(
    pos: ex.Vector,
    layerName: string
  ): GridObject | undefined {
    let layer = this.getLayer(layerName);
    if (layer) {
      for (let object of layer.objects) {
        if (object.pos === pos) {
          return object;
        }
      }
    }
    return undefined;
  }

  public getLayer(name: string): GridLayer | undefined {
    for (let layer of this.layers) {
      if (layer.name === name) {
        return layer;
      }
    }
    return undefined;
  }

  public removeTile(tile: GridTile, layerName: string) {
    let layer = this.getLayer(layerName);
    layer?.tiles[layer?.tiles.indexOf(tile)].actor.kill();
    layer?.tiles.splice(1, layer?.tiles.indexOf(tile));
  }

  public removeObject(object: GridObject, layerName: string) {
    let layer = this.getLayer(layerName);
    layer?.tiles[layer?.objects.indexOf(object)].actor.kill();
    layer?.tiles.splice(1, layer?.objects.indexOf(object));
  }
}

export class PathFinder {
  public grid: Grid;
  public layerName: string;

  constructor(grid: Grid, layerName: string) {
    this.grid = grid;
    this.layerName = layerName;
  }

  findPath(startTile: GridTile, endTile: GridTile): GridTile[] {
    const path: GridTile[] = [];

    const startPos = startTile.actor.pos;
    const endPos = endTile.actor.pos;

    // Move vertically until on the same y-coordinate
    let currentY = startPos.y;
    while (currentY !== endPos.y) {
      currentY += currentY < endPos.y ? 1 : -1;
      const tile = this.grid.getTileColliding(
        new ex.Vector(startPos.x, currentY),
        this.layerName
      );
      if (tile) {
        path.push(tile);
      }
    }

    // Move horizontally until on the same x-coordinate
    let currentX = startPos.x;
    while (currentX !== endPos.x) {
      currentX += currentX < endPos.x ? 1 : -1;
      const tile = this.grid.getTileColliding(
        new ex.Vector(currentX, endPos.y),
        this.layerName
      );
      if (tile) {
        path.push(tile);
      }
    }

    return path;
  }
}
