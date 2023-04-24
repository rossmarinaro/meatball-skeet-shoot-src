

//3D

import * as ENABLE3D from '@enable3d/phaser-extension';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { System } from './Config';

import { Inventory3D } from '../game/inventory/inventoryManager';
import { Player3D } from '../game/player';
import { Particles3D } from '../game/particles3d';
import { HUD3D } from '../game/hud';
import { Controller3D } from '../game/controller';
import { LevelManager3D } from '../game/levelManager';
import { Lighting } from '../game/lighting';
import { Actor } from '../game/Actor';


export class ThirdDimension {

    private static debugGraphics: boolean
    private static backgroundFill: Phaser.GameObjects.Graphics
    public static debugParams: boolean

    public static cache: { key: string, data: any }[] = []
    
    public static Player3D: typeof Player3D = Player3D
    public static Particles3D: typeof Particles3D = Particles3D
    public static Inventory3D: typeof Inventory3D = Inventory3D
    public static Lighting: typeof Lighting = Lighting
    public static LevelManager3D: typeof LevelManager3D = LevelManager3D
    public static Actor: typeof Actor = Actor
    public static THREE: typeof ENABLE3D.THREE = ENABLE3D.THREE
    public static HUD3D: HUD3D
    public static Controller3D: Controller3D
    public static GLTF: GLTF

    
    //--------------------- init third dimension


    public static async init (scene: ENABLE3D.Scene3D, camPosX: number, camPosY: number, camPosZ: number): Promise<void>  
    {

        return new Promise(async res => {
        
            scene.data['items'] = [];
            scene.data['powerups'] = [];
            scene.data['weapons'] = [];
    
            scene['controller'] = new Controller3D(scene);
      
            System.Process.orientation.unlock();
    
            System.Config.makeTransparantBackground(scene['__scene']);

            scene.clearThirdDimension();
            scene.accessThirdDimension({ maxSubSteps: 10, fixedTimeStep: 1 / 180 });  
            
        //default camera position
                
            scene.third.camera.position.set(camPosX, camPosY, camPosZ);  
    
            ThirdDimension.debugGraphics = true;
            ThirdDimension.debugParams = true;
    
            if (process.env.NODE_ENV !== 'production') 
            {
                ThirdDimension.toggleDebugGraphics(scene);
                ThirdDimension.toggleDebugParams(scene);
    
                //call to see memory allocations 
    
                window['renderer'] = scene.third.renderer.info;
            }

            //run HUD scene in parallel
    
            ThirdDimension.backgroundFill = scene.add.graphics({fillStyle: {color: 0x000000}}).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 30000, 30000));

            scene.scene.launch('HUD3D', scene);

            res();
        });
    }


    //------------------------------ create map, player, controller, HUD


    public static async create(scene: ENABLE3D.Scene3D, levelKey: string, playerParams?: any[]): Promise<void>  
    {
 
        return new Promise(async res => {

            const hud = scene.scene.get('HUD3D');

            scene.third.camera.lookAt(-10, 10, 10);
            
        //preload assets 

            await scene.scene.get('Preload')['loadAssets'](scene['__scene'], scene); 

            hud['stopAlerts'](); 

           ThirdDimension.backgroundFill.destroy();
            
        //load map before objects
            
            await LevelManager3D.load(scene, levelKey);

        //init hud display


            await hud['initDisplay']();


            if (playerParams)
            {

            //init player

                scene['player'] = new Player3D(scene, playerParams[0], playerParams[1], playerParams[2], playerParams[3], playerParams[4]);  

            //init controls

                scene['controller'].init(scene['player']);

            //update HUD

                hud['runUpdate']();

            }

        //set post processing pipeline

            System.Process.app.shaders.setPostProcessingBloom(scene, { bloomStrength: 0.5, bloomThreshold: 0, bloomRadius: 0.5 });

            scene.events.on('update', (time: number): void => {

        //update shaders

                System.Process.app.shaders.shaderMaterials.filter((shader: ENABLE3D.THREE.ShaderMaterial) => {
                    
                    if (shader.uniforms.time)
                        shader.uniforms.time.value += 0.01;
                });

            }); 

            scene.cameras.main.fadeIn(4000, 0, 0, 0);

            res();
        });
        
    }

    //----------------------------- soft reset


    public static reset(scene: ENABLE3D.Scene3D): void
    {
        scene.third.scene.clear();
        LevelManager3D.reset(scene);
        Inventory3D.reset(0);
    }
    


    //----------------------------------- destroy objects and third dimension


    public static shutDown(scene: ENABLE3D.Scene3D): void
    {

        ThirdDimension.reset(scene);
        scene.clearThirdDimension();
        ThirdDimension.cache = [];

    }


    //------------------------------------- debug graphics

    
    public static toggleDebugGraphics(scene: ENABLE3D.Scene3D): void
    {

        scene.input.keyboard.on('keydown-G', () => {

            ThirdDimension.debugGraphics = ThirdDimension.debugGraphics ? 
                false : true;

            ThirdDimension.debugGraphics ? 
                scene.third.physics.debug?.disable() : scene.third.physics.debug?.enable();
        });
    }


    //--------------------------------- debug params

    
    public static toggleDebugParams(scene: ENABLE3D.Scene3D): void
    {
        scene.input.keyboard.on('keydown-H', () => ThirdDimension.debugParams = ThirdDimension.debugParams ? false : true);
    }

}