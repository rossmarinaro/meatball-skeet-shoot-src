
import { ExtendedObject3D, Scene3D } from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Inventory3D } from './inventory';


//------------------------------------------------------------------------- RIFLE

export class ItemProp extends ExtendedObject3D {

    private scene: Scene3D
    private x: number | undefined
    private y: number | undefined
    private z: number | undefined
    
    public _id: number | string | undefined

    constructor(scene: Scene3D, type: string, x?: number, y?: number, z?: number, _id?: number | string)
    {
      super();

      this.scene = scene;
      this.name = type;
      this.x = x;
      this.y = y;
      this.z = z;
      this._id = _id;    

      this.scene.third.load.gltf(this.name).then((gltf: GLTF) => this._init(gltf));
    
    }
    private _init(glb: any): void
    {

      this.add(glb.scene);

      if (this.x && this.y && this.z)
      {
        this.scene.third.add.existing(this);
        this.position.set(this.x, this.y, this.z);
        this.scene.third.physics.add.existing(this, {shape: 'sphere', radius: 3, collisionFlags: 6});

      //spin pickup
        this.scene.events.on('update', ()=> {
          if (this.hasBody)
          {
            this.rotation.y += 0.03;
            this.body.needUpdate = true;
          }
        });
      }
      else
        this.scene.third.add.existing(this);
  
      this.traverse((child: any) => {
  
        if (child.isMesh)
        {

          Inventory3D.setAsStandAloneItem(this.name, this, child);

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