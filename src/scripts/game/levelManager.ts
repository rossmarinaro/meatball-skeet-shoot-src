import * as ENABLE3D from '@enable3d/phaser-extension'
import { Actor } from './Actor'

export class LevelManager3D { 

  private static ignoreCollisions: string[] = [ 'platform' ]

  public static currentLevel: string = ''
  public static level: Actor
  public static bounds: { left: number, right: number, top: number, bottom: number } | null 
  public static lightingTextures: ENABLE3D.THREE.Texture[] = []

  //load map

  public static async load (scene: ENABLE3D.Scene3D, key: string): Promise<Readonly<boolean>>
  {
    //preload level and init collisions
    
    this.currentLevel = key;

    if (this.level !== null)
      scene.third.scene.remove(this.level);

    this.level = new Actor(scene, this.currentLevel); 

    if (!this.currentLevel.includes('-no-model')) {
      await this.level.preload(true);
      await this.setCollisions(scene);  
    }

    //apply lightmap texture to level objects

    const lightmapTexture = await this.loadLightingTexture(scene, 'lightmap'),
          lightmapTexture2 = await this.loadLightingTexture(scene, 'lightmap2'),
          aoMapTexture = await this.loadLightingTexture(scene, 'aomap');

    this.lightingTextures.push(lightmapTexture, lightmapTexture2, aoMapTexture);

    let lightmapAlternateTex = false;

    this.level.traverse(child => {
        if (child instanceof ENABLE3D.THREE.Mesh) 
        {
            const mesh = (child as ENABLE3D.THREE.Mesh); 

            if (mesh.material)  
                this.setLightingToMesh(mesh, lightmapAlternateTex ? lightmapTexture2 : lightmapTexture, 2.0, aoMapTexture, 1.5); 

            lightmapAlternateTex = !lightmapAlternateTex;
        }
    });

    //load level objects 

    switch (this.currentLevel)
    {
      case 'range': default: (await import ('../game/maps/room')).Range(scene); break;
    }

    return true;

  }
  

  //---------------- set physics / collisions


  private static async setCollisions (scene: ENABLE3D.Scene3D): Promise<void>
  {
    return new Promise(res => { 

       const levelObjs = (this.level.obj as any).scene.children; 

       if (levelObjs)
            this.ignoreCollisions.forEach(i => {
                levelObjs.forEach((child: ENABLE3D.ExtendedMesh) => {
                    if (!child.name.includes(i))
                        scene.third.physics.add.existing(child, { shape: 'convex', mass: 0, collisionFlags: 1, autoCenter: false });
                });
            });
      res();
    });
  } 


  //---------------------------------------------


  public static async setStageBounds (position: number[]): Promise<void>
  {
    this.bounds = {
        left: position[0],
        right: position[1],
        top: position[2],
        bottom: position[3]
    }
  }

//---------------------------------------------


  private static async loadLightingTexture (scene3d: ENABLE3D.Scene3D, key: string): Promise<ENABLE3D.THREE.Texture>
  {
    const texture = await scene3d.third.load.texture(key);
    
    texture.channel = 1; 
    texture.colorSpace = ENABLE3D.THREE.NoColorSpace; 
    texture.flipY = false;

    return texture;
  }


  //--------------------------------------------- light maps and ambient occlusion maps


    public static setLightingToMesh (
        mesh: ENABLE3D.THREE.Mesh, 
        lightMap: ENABLE3D.THREE.Texture, 
        lightMapIntensity: number,
        aoMap: ENABLE3D.THREE.Texture, 
        aoMapIntensity: number
    ): void 
    {
        if (mesh.geometry.attributes.uv) {
            if (!mesh.geometry.attributes.uv1)
                mesh.geometry.setAttribute('uv1', mesh.geometry.attributes.uv.clone('uv')); 
            if (!mesh.geometry.attributes.uv2)
                mesh.geometry.setAttribute('uv2', mesh.geometry.attributes.uv.clone('uv')); 
        }

        mesh.material = new ENABLE3D.THREE.MeshStandardMaterial({
            map: (mesh.material as unknown as ENABLE3D.THREE.MeshStandardMaterial).map,
            lightMap,
            lightMapIntensity,
            aoMap,
            aoMapIntensity,
            side: ENABLE3D.THREE.DoubleSide
        });

        mesh.material.needsUpdate = true;    
    }



  //-------------------------------------------- make skybox


  public static makeSkybox(scene: ENABLE3D.Scene3D, side: string, cap?: string): void
  {
    cap = !cap ? side : cap;
    
    const loader = new ENABLE3D.THREE.CubeTextureLoader(),
          texture = loader.load([ side, side, cap, cap, side, side ]);

    scene.third.heightMap.scene.background = texture;

  }

  
  //------------------------------------------ reset defaults
  

  public static reset(scene: ENABLE3D.Scene3D): void
  {
    Actor.idIterator = 0;
    this.lightingTextures.length = 0;
    
    if (this.level && this.level.obj) {

        const levelObjs = (this.level.obj as any).scene.children; 

       if (levelObjs)
            levelObjs.forEach((child: ENABLE3D.ExtendedMesh) => {
                if (child.hasBody) //@ts-ignore
                    scene.third.physics.destroy(child);
            });
    }

    this.bounds = null;
    this.currentLevel = '';
  }

}