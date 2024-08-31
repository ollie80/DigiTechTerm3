import * as ex from 'excalibur';
import { start } from 'repl';
import { getRandom } from './support';
import { Resources } from './resources';
import { TiledLayerComponent } from '@excaliburjs/plugin-tiled/dist/src/deprecated';
import { Layer, TiledMap } from '@excaliburjs/plugin-tiled';
import { AsyncResource } from 'async_hooks';
import { Game } from './game';

export type GridArgs = {
  pos: ex.Vector; //topleft of grid
  size: ex.Vector; //size in tiles
  layers: string[];
  tileSize: number;
};

export type GridTileArgs = {
  pos: ex.Vector; //pos in grid, not world pos
  resource: string;
};

export type GridObjectArgs = {
  pos: ex.Vector;
  resource: string;
  size: ex.Vector;
};

export type GridLayerArgs = {
  name: string;
  isMapped?: boolean;
};

export class GridTile {
  public actor: ex.Actor;
  public pos: ex.Vector;
  private resource: string;

  constructor(
    private grid: Grid,
    private layer: string,
    args: GridTileArgs
  ) {
    this.pos = args.pos;
    this.resource = args.resource;
    this.actor = new ex.Actor({
      pos: ex.vec(this.pos.x * this.grid.tileSize, this.pos.y * this.grid.tileSize)
    });
    this.actor.graphics.use(ex.Sprite.from(Resources[this.resource]));
    this.pos = args.pos;
    this.grid.game.add(this.actor);
  }
}

export class GridObject {
  public actor: ex.Actor;
  public pos: ex.Vector;
  private resource: string;
  private size: ex.Vector;

  constructor(
    private grid: Grid,
    private layer: string,
    args: GridObjectArgs
  ) {
    this.resource = args.resource;
    this.size = args.size;
    this.pos = args.pos;
    this.actor = new ex.Actor({
      pos: ex.vec(this.pos.x * this.grid.tileSize, this.pos.y * this.grid.tileSize),
      z: 99999999
    });
    this.actor.graphics.use(ex.Sprite.from(Resources[this.resource]));
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

  public getTileAtPos(pos: ex.Vector, layerName: string): GridTile | undefined {
    let layer = this.getLayer(layerName);
    if (layer) {
      for (let tile of layer.tiles) {
        if (tile.pos === pos) {
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

  public getObjectAtPos(pos: ex.Vector, layerName: string): GridObject | undefined {
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

export type Node = {
  Id: number;
  x: number;
  y: number;
  collider: boolean;
  gCost: number;
  hCost: number;
  fCost: number;
  checked: boolean;
  parent: Node | null;
};

export class PathFinder {
  public Nodes: Node[] = [];
  public rows: number;
  public cols: number;
  public checkedNodes: Node[] = [];
  public currentNode: Node | null = null;
  public currentIndex: number | undefined;
  public startnode: Node | null = null;
  public endnode: Node | null = null;
  public goalReached = false;
  public openNodes: Node[] = [];

  constructor(map: ex.TileMap) {
    this.cols = map.columns;
    this.rows = map.rows;
    let nodeIndex = 0;
    let tileIndex = 0;
    for (const tile of map.tiles) {
      if (tile.getGraphics().length != 0) {
        this.Nodes.push({
          x: tile.center.x / 16,
          y: tile.center.y / 16,
          collider: tile.solid,
          checked: false,
          hCost: 0,
          gCost: 0,
          fCost: 0,
          Id: nodeIndex,
          parent: null
        });
        nodeIndex++;
      }
      tileIndex++;
    }
    this.currentNode = this.Nodes[0];
  }

  setCost() {
    if (this.startnode === null || this.endnode === null) return;
    if (this.Nodes.length === 0) return;
    for (const tile of this.Nodes) {
      tile.gCost = this.getGCost(tile, this.startnode);
      tile.hCost = this.getHCost(tile, this.endnode);
      tile.fCost = this.getFCost(tile);
    }
  }

  astar(sourcenode: Node, endnode: Node, diagonal = false) {
    this.startnode = sourcenode;
    this.endnode = endnode;
    this.goalReached = false;
    this.checkedNodes = [];
    this.openNodes = [];
    this.setCost();
    this.openNodes.push(this.startnode);
    let path: Node[] = [];
    while (this.openNodes.length > 0) {
      this.currentNode = this.openNodes[0];
      this.currentIndex = 0;

      for (const node of this.openNodes) {
        if (node.fCost < this.currentNode.fCost) {
          this.currentNode = node;
          this.currentIndex = this.openNodes.indexOf(node);
        }
      }
      this.openNodes.splice(this.currentIndex, 1);
      this.checkedNodes.push(this.currentNode);
      if (
        this.currentNode === this.endnode &&
        this.currentNode != null &&
        this.currentNode != undefined &&
        this.currentNode.parent != undefined &&
        this.currentNode.parent != null
      ) {
        path = [];
        do {
          path.push(this.currentNode as Node);
          this.currentNode = this.currentNode.parent as Node;
        } while (this.currentNode !== this.startnode);
        path = path.reverse();
        this.goalReached = true;

        this.resetGrid();
        return path;
      }
      const neighbors = this.getNeighbors(this.currentNode, diagonal);
      for (const neighbor of neighbors) {
        if (!this.checkedNodes.includes(neighbor)) {
          if (!this.openNodes.includes(neighbor) && !neighbor.collider) {
            neighbor.parent = this.currentNode;
            this.openNodes.push(neighbor);
          }
        }
      }
    }
    this.resetGrid();
    return [];
  }

  getNeighbors(targetNode, diagonal) {
    const neighbors: Node[] = [];
    for (let node of this.Nodes) {
      if (node.x === targetNode.x - 1 && node.y === targetNode.y) {
        if (!neighbors.includes(node)) {
          neighbors.push(node);
        }
      } else if (node.x === targetNode.x + 1 && node.y === targetNode.y) {
        if (!neighbors.includes(node)) {
          neighbors.push(node);
        }
      } else if (node.x === targetNode.x && node.y === targetNode.y - 1) {
        if (!neighbors.includes(node)) {
          neighbors.push(node);
        }
      } else if (node.x === targetNode.x && node.y === targetNode.y + 1) {
        if (!neighbors.includes(node)) {
          neighbors.push(node);
        }
      }
      if (diagonal) {
        if (node.x === targetNode.x - 1 && node.y === targetNode.y - 1) {
          if (!neighbors.includes(node)) {
            neighbors.push(node);
          }
        } else if (node.x === targetNode.x + 1 && node.y === targetNode.y + 1) {
          if (!neighbors.includes(node)) {
            neighbors.push(node);
          }
        } else if (node.x === targetNode.x + 1 && node.y === targetNode.y - 1) {
          if (!neighbors.includes(node)) {
            neighbors.push(node);
          }
        } else if (node.x === targetNode.x - 1 && node.y === targetNode.y + 1) {
          if (!neighbors.includes(node)) {
            neighbors.push(node);
          }
        }
      }
    }

    return neighbors;
  }

  getNodeByIndex(index) {
    return this.Nodes[index];
  }
  getNodeByCoord(x, y) {
    for (let node of this.Nodes) {
      if (node.x === x && node.y === y) {
        return node;
      }
    }
    return this.Nodes[0];
  }
  getRandomNode() {
    return this.Nodes[getRandom(0, this.Nodes.length - 1)];
  }
  getGCost(node, startnode) {
    return Math.abs(node.x - startnode.x) + Math.abs(node.y - startnode.y);
  }
  getHCost(node, endnode) {
    return Math.abs(node.x - endnode.x) + Math.abs(node.y - endnode.y);
  }
  getFCost(node) {
    return node.gCost + node.hCost;
  }
  resetGrid() {
    for (const tile of this.Nodes) {
      tile.checked = false;
      tile.gCost = 0;
      tile.hCost = 0;
      tile.fCost = 0;
    }
    this.checkedNodes = [];
    this.startnode = null;
    this.endnode = null;
    this.goalReached = false;
  }
}
