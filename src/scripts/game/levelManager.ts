
import * as ENABLE3D from '@enable3d/phaser-extension';

import { Room } from './maps/room';
import { Actor } from './Actor';


export class LevelManager3D {

  private static currentLevel: string = ''
  
  public static level: Actor
  public static bounds: { left: number, right: number, top: number, bottom: number } | null 

  //------------------------------------------- load map

  public static async load (scene: ENABLE3D.Scene3D, key: string): Promise<Readonly<boolean>>
  {
    
    LevelManager3D.currentLevel = key;
    LevelManager3D.level = new Actor(scene, LevelManager3D.currentLevel);

    await LevelManager3D.level.preload(true);
    await LevelManager3D.setCollisions(scene);

    switch (LevelManager3D.currentLevel)
    {
      case 'room': Room(scene); break;

    }

    return true;

  }

  //--------------------------------------------------- set physics / collisions

  private static async setCollisions (scene: ENABLE3D.Scene3D): Promise<void>
  {

    return new Promise(res => {
      
      const obj = LevelManager3D.level.obj.scene.children; 

      if (obj)
      {
        obj.forEach((child: ENABLE3D.ExtendedObject3D ) => {

        child.castShadow = child.receiveShadow = true;

          res(
            scene.third.physics.add.existing(child, {
              shape: 'convex',
              mass: 0,
              collisionFlags: 1,
              autoCenter: false
            })
          );
        });
      }
    });
    
  } 

  //-------------------------------------------- make skybox


  public static makeSkybox(scene: ENABLE3D.Scene3D, key: string): void
  {

    const loader = new ENABLE3D.THREE.CubeTextureLoader(),
          texture = loader.load([key, key, key, key, key, key]);

    scene.third.heightMap.scene.background = texture;

  }

  //------------------------------------------ reset defaults
  

  public static reset(scene: ENABLE3D.Scene3D): void
  {

    LevelManager3D.level.obj.scene.children.map((i: ENABLE3D.ExtendedObject3D) => {
        if (i.hasBody)
        scene.third.physics.destroy(i);
    });

    LevelManager3D.bounds = null;
    LevelManager3D.currentLevel = '';
  }
  

   
}