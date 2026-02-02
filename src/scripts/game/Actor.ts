import * as ENABLE3D from '@enable3d/phaser-extension'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'   
import { ThirdDimension } from '../internals/ThirdDimension'
import { LevelManager3D } from './levelManager'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

//----------------- 3D Model Base Class can be loaded on demand, or in one call


export class Actor extends ENABLE3D.ExtendedObject3D {

    private _type: string

    public x?: number
    public y?: number
    public z?: number
    public pos: ENABLE3D.THREE.Vector3
    public callback?: Function 

    public key?: string | null
    public asset_id: string
    public obj: ENABLE3D.THREE.Group<ENABLE3D.THREE.Object3DEventMap> | GLTF 
    public scene: ENABLE3D.Scene3D
    public isCollide: boolean = false

    public static idIterator: number = 0

    constructor (

      scene: ENABLE3D.Scene3D, 
      key?: string | null, 
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
      this.pos = new ENABLE3D.THREE.Vector3(x, y, z);
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
      return new Promise(async res => {
        
        if (!this.key) {
          res();
          return;
        }

        const utils = (await import ('../internals/Utils')).default,
     
        filepath = await utils.strings.getFilePathByKey(this.key, 'resources_3d', 'assets'); 
     
        this._type = utils.strings.getFileType(filepath);   

        this.asset_id = `${this.type + '_' + Actor.idIterator}`;
   
        const resources = ThirdDimension.cache.current.filter(resource => resource.key === this.key); 

        resources.forEach(async resource => {

            this.obj = resource.data; 

            switch (this._type)
            {

              case 'glb': 
                this.add((resource.data as GLTF).scene.clone()); 
              break;

              case 'fbx': 
                this.add(SkeletonUtils.clone((resource.data as ENABLE3D.THREE.Group<ENABLE3D.THREE.Object3DEventMap>))); 
               break;

              default: 
                return console.log('Actor Preload Failed: No model data found.'); 
        
            } 

            //clone materials

            this.traverse(async child => { 
                
                if (child.isMesh) {
                    const mesh = child as unknown as ENABLE3D.THREE.Mesh;
                    mesh.material = (mesh.material as ENABLE3D.THREE.MeshBasicMaterial).clone();
                    mesh.material.needsUpdate = true;
                }
            });

            //load if specified

            res(this.load(willRender));
        });
      });
    }


    //---------------------------------- manually load mesh


    public async load(render?: boolean): Promise<void>
    {
        return new Promise(res => {
  
            if (this.obj) {
                for (let i in this.obj.animations) 
                    this.anims.add(this.obj.animations[i].name, this.obj.animations[i]);
      
                this.scene.third.animationMixers.add(this.anims.mixer); 
            }
        
            if (render) {
                if (this.x && this.y && this.z)
                    this.position.set(this.x, this.y, this.z);
      
                this.scene.third.add.existing(this);
            }
      
            if (this.callback)
              this.callback(this); 
  
            res();
        });
  
    }


    //----------------- collides with stage

      
    public checkCollisionWithStage (otherObject: ENABLE3D.ExtendedObject3D): void
    {

      this.isCollide = otherObject.parent?.parent?.['key'].includes(LevelManager3D.currentLevel);

      if (this.isCollide)
      {

        Math.random() * 1 > 0.5 ? 
          this.position.x-- : 
          this.position.x++;

        Math.random() * 1 > 0.5 ? 
          this.position.z-- : 
          this.position.z++;

        if (this.body)
          this.body.needUpdate = true; 
      }

    }

}