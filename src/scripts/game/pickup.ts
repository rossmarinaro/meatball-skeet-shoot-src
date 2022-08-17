
import { System } from '../internals/Config';
import { THREE, ExtendedObject3D, Scene3D } from '@enable3d/phaser-extension';



//------------------------------------------------------------------------- RIFLE

export class Pickup extends ExtendedObject3D {

  private scene: Scene3D

    constructor(scene: Scene3D, type: string)
    {
      super();
      this.scene = scene;
      this.name = type;
     
      this.scene.third.load.gltf(type).then((gltf: any) => this._init(gltf));
    
    }
    private _init(gltf: any): void
    {

      this.add(gltf.scene);
  
      this.scene.third.add.existing(this, {collisionFlags: 6});
  
      this.traverse((child: any) => {
  
        if (child.isMesh)
        {
          child.castShadow = child.receiveShadow = true;
          if (child.material)
          {
            child.material.metalness = 0.3;
            child.material.roughness = 0.3;
          }
        }
      });
    }
}