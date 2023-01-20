
import * as ENABLE3D from '@enable3d/phaser-extension';

import { Room } from './maps/room';
import { Actor } from './Actor';


export class LevelManager3D {

  private static currentLevel: string 
  
  public static level: Actor

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
      
      let obj = LevelManager3D.level.obj; 

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

   
}