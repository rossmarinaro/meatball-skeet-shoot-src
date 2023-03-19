import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from '../internals/Config'


//----------------- Actor FBX / GLB

export class Actor extends ENABLE3D.ExtendedObject3D {

    public x?: number
    public y?: number
    public z?: number
    public asset_id: string
    public key: string
    public obj: any
    public scene: ENABLE3D.Scene3D
    public callback?: Function 

    private static idIterator: number = 0
    
    constructor (
      scene: ENABLE3D.Scene3D, 
      key: string, 
      x?: number,
      y?: number,
      z?: number,
      willLoad?: boolean, 
      willRender?: boolean, 
      callback?: Function 
    )
    {

      super();

      Actor.idIterator++;

      this.x = x;
      this.y = y;
      this.z = z;
      this.scene = scene;
      this.callback = callback;
      this.key = key;
      this.name = `${this.key + '_' + Actor.idIterator}`; 

      if (willLoad)
        this.preload(willRender); 
      
    }

    //------------------------------- preload file extension and load

    public async preload (willRender?: boolean): Promise<Readonly<void>>
    {
      
      this.type = await System.Process.utils.getFileType(this.scene, this.key);

      this.asset_id = `${this.type + '_' + Actor.idIterator}`; 

      this.type === 'glb' ?

        await this.scene.third.load.gltf(this.key).then(async (obj: typeof System.Process.utils.GLTF) => {
          this.morphTargetInfluences = obj['morphTargetInfluences'];
          this.obj = obj; 
          this.add(obj.scene); 
        }) :
        await this.scene.third.load.fbx(this.key).then(async (obj: any) => {
          this.obj = obj;
          this.add(obj); 
        });

        this.load(willRender);
    }

   
    //---------------------------------- 

    public async load(render?: boolean): Promise<Readonly<void>>
    {

      for (let i in this.obj.animations) 
        this.anims.add(this.obj.animations[i].name, this.obj.animations[i]);

      this.scene.third.animationMixers.add(this.anims.mixer); 
  
      if (render)
      {
        
        if (this.x && this.y && this.z)
          this.position.set(this.x, this.y, this.z);

        this.scene.third.add.existing(this);

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

      if (this.callback)
        this.callback();

    }

}