//3D

import * as ENABLE3D from '@enable3d/phaser-extension';
import { System } from './Config';

import { Inventory3D } from '../game/inventory/inventoryManager';
import { Player3D } from '../game/player';
import { Particles3D } from '../game/particles3d';
import { HUD3D } from '../game/hud';
import { Controller3D } from '../game/controller';
import { LevelManager3D } from '../game/levelManager';
import { Lighting } from '../game/lighting';


export class ThirdDimension {

    public static Player3D: typeof Player3D = Player3D
    public static Inventory3D: typeof Inventory3D = Inventory3D
    public static Particles3D: typeof Particles3D = Particles3D
    public static HUD3D: typeof HUD3D = HUD3D
    public static Controller3D: typeof Controller3D = Controller3D
    public static Lighting: typeof Lighting = Lighting

  //--------------------- init third dimension


  public static init (
        
    scene: ENABLE3D.Scene3D,  
    camPosX: number, 
    camPosY: number, 
    camPosZ: number
    
): void  
{

    scene.data['items'] = [];
    scene.data['powerups'] = [];
    scene.data['weapons'] = [];

    Inventory3D.reset(0);

    System.Process.orientation.unlock();

    System.Config.makeTransparantBackground(scene['_scene']);
    
    scene['accessThirdDimension']({ maxSubSteps: 10, fixedTimeStep: 1 / 180 });  

//default camera position
        
    scene.third.camera.position.set(camPosX, camPosY, camPosZ);  
    scene.third.camera.lookAt(-10, 10, 10);

}


//------------------------------ create map, player, controller, HUD


public static async create(scene: ENABLE3D.Scene3D, levelKey: string, playerParams?: any[]): Promise<void>  
{


//load map before objects

    await LevelManager3D.load(scene, levelKey);
    
    scene['hud'] = new HUD3D(scene);
    scene['controller'] = new Controller3D(scene);

    if (playerParams)
    {
        scene['player'] = new Player3D(scene, playerParams[0], playerParams[1], playerParams[2], playerParams[3], playerParams[4]);  
        scene['controller'].init(scene['player']);
        scene['hud'].init();

    }

//set post processing pipeline

    System.Process.app.shaders.setPostProcessingBloom(scene, { bloomStrength: 0.5, bloomThreshold: 0, bloomRadius: 0.5 });

//---------- log collisions

    // this.third.physics.collisionEvents.on('collision', data => {
    //   const { bodies, event } = data
    //   console.log(bodies[0].name, bodies[1].name, event)
    // });

    scene.events.on('update', (time: number): void => {

    //update shaders

        System.Process.app.shaders.shaderMaterials.filter((shader: ENABLE3D.THREE.ShaderMaterial) => {
            
            if (shader.uniforms.time)
                shader.uniforms.time.value += 0.01;
        });

    });
    
}



}