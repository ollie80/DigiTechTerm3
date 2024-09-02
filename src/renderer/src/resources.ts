import { ImageFiltering, ImageSource, Loadable, Loader, Resource, TileMap, Sound } from "excalibur";
import { TiledResource } from '@excaliburjs/plugin-tiled';

import player from './assets/graphics/player.png?url';
import ground from './assets/graphics/ground.png?url';

//rubbish
import rubbish0 from './assets/graphics/rubbish/0.png?url';
import rubbish1 from './assets/graphics/rubbish/1.png?url';
import rubbish2 from './assets/graphics/rubbish/2.png?url';

// import music from './assets/audio/main_theme.mp3';
// import explosion from './assets/audio/explosion.mp3'

import { Recoverable } from "repl";


export const Resources = {
    playerSpriteSheet: new ImageSource(player, {filtering: ImageFiltering.Pixel}),
    ground: new ImageSource(ground, {filtering: ImageFiltering.Pixel}),
    rubbish0: new ImageSource(rubbish0, {filtering: ImageFiltering.Pixel}),
    rubbish1: new ImageSource(rubbish1, {filtering: ImageFiltering.Pixel}),
    rubbish2: new ImageSource(rubbish2, {filtering: ImageFiltering.Pixel}),

    // //audio
    // music: new Sound(music),
    // explosionSound: new Sound(explosion)
  
  }

export const loader = new Loader();
for (let resource of Object.values(Resources)) {
    loader.addResource(resource);
}