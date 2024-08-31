import * as ex from 'excalibur';
import { Resources } from './resources';
import './support'

export class Player extends ex.Actor {
    constructor(pos: ex.Vector) {
        super({
            pos,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.Active
        })
    }

    onInitialize(engine: ex.Engine): void {
    }

    onPreUpdate(engine: ex.Engine, elapsedMs: number): void {
        this.vel = ex.Vector.Zero;

        
    }
}