import { ImageFiltering, ImageSource, Loadable, Loader, Resource, TileMap } from "excalibur";
import { TiledResource } from '@excaliburjs/plugin-tiled';


export const Resources = {
    
  }

export const loader = new Loader();
for (let resource of Object.values(Resources)) {
    //loader.addResource(resource);
}