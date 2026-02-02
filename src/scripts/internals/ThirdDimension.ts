//enable3D, THREE.js 

import * as ENABLE3D from '@enable3d/phaser-extension'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { System } from '../internals/Config'
import { EventManager } from '../internals/Events'


export class ThirdDimension {

    private static debugGraphics: boolean 
    private static backgroundFill: Phaser.GameObjects.Graphics

    public static debugParams: boolean
    public static camType: number

    //object cache

    public static cache: { 

        base: string[], 
        preload: string[], 
        current: { key: string, data: any }[] 
    } = { 
        base: [ 
            'bullet_3d',
            'automac1000',
            'bh_model'
        ], 
        preload: [],  
        current: [] 
    }
    
    public static THREE: typeof ENABLE3D.THREE = ENABLE3D.THREE
    public static GLTF: GLTF

    
    //--------------------- init third dimension


    public static async init (scene: ENABLE3D.Scene3D, camType: number, assetsToLoad?: string[], loadStandardObjects: boolean = true): Promise<void>  
    {
        return new Promise(async res => {

            scene.tweens.killAll();

            const { Controller3D } = (await import ('../game/controller'));
    
            scene['controller'] = new Controller3D(scene);

            //load base cache

            if (loadStandardObjects)
                this.cache.preload.push(...this.cache.base);

            //load on demand 

            if (assetsToLoad && assetsToLoad.length > 0)
                this.cache.preload.push(...assetsToLoad);
            
            System.Process.orientation.lock(innerWidth > innerHeight ? 'landscape-primary' : 'portrait-primary'); 
 
            const game = document.getElementById('game');
        
            if (game !== null)
                game.getElementsByTagName('canvas')[0].style.backgroundColor = 'transparent'; 

            scene.accessThirdDimension({ maxSubSteps: 10, fixedTimeStep: 1 / 180 });  
            ENABLE3D.THREE.ColorManagement.enabled = true;
            scene.third.renderer.outputColorSpace = ENABLE3D.THREE.SRGBColorSpace;
            scene.third.renderer.autoClear = false;

            //default camera style

            this.camType = camType;
    
            this.debugGraphics = true;
            this.debugParams = true;
    
            if (process.env.NODE_ENV !== 'production') 
            {
                this.toggleDebugGraphics(scene);
                this.toggleDebugParams(scene);
    
                window['renderer'] = scene.third.renderer.info;
            }
    
            this.backgroundFill = scene.add.graphics({ fillStyle: { color: 0x000000 } }).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 30000, 30000));

            if (!scene.scene.manager.getScene('Alerts')) {
                const { Alerts } = await import('./alerts');
                scene.scene.manager.add('Alerts', Alerts); 
            }

            scene.scene.run('Alerts', scene);
   
            res();
        });
    }

        
    //----------------------------------------------- 3d


    public static async loadAssets (scene: Phaser.Scene, scene3d: ENABLE3D.Scene3D): Promise<void> 
    {
        
        return new Promise(async res => { 

            ENABLE3D.THREE.Cache.enabled = true;

            const alerts: Phaser.Scene = scene.scene.get('Alerts');

            //skip preload if items are cached

            if (this.cache.current.length > 0) {
                res(); 
                return;
            } 

            alerts['alert']('large', 'Loading assets...', 'please wait');
        
            let width = 0, 
                height = 0,
                numAssets = 0;

            const base = alerts.add.graphics().fillStyle(0xffff00, 1),
                  base2 = alerts.add.graphics({ lineStyle: { width: 3, color: 0xff0000 } }),
            
            progressBarGraphics = alerts.add.graphics();

            const resParser = (await import ('./parser')).parseResources, 

            resources = await resParser(scene3d, scene.cache.json.get('resources_3d'));

            //load progress update 

            alerts.events.on('update', () => {

                width = alerts['GAME_WIDTH'] / 2, 
                height = alerts['GAME_HEIGHT'] / 2 + 100;
                
                const standardAspect: boolean = !System.Config.mobileAndTabletCheck() && System.Config.isLandscape(alerts),
                      percent = (numAssets / 100) * this.cache.preload.length, 
                      baseW = standardAspect ? (65 / 100) * width : (85 / 100) * width;
                
                let xPos: number,
                    yPos: number;
        
                base.clear().fillStyle(0xffff00, 1).fillRoundedRect(standardAspect ? (68 / 100) * width : (57 / 100) * width, System.Config.mobileAndTabletCheck() && System.Config.isPortrait(alerts) ? (84 / 100) * height : (85 / 100) * height, baseW, 50, 10);
        
                base2.clear().strokeRoundedRect(standardAspect ? (68 / 100) * width : (57 / 100) * width, System.Config.mobileAndTabletCheck() && System.Config.isPortrait(alerts) ? (84 / 100) * height : (85 / 100) * height, standardAspect ? (65 / 100) * width : (85 / 100) * width, 50, 10);
        
                if (System.Config.mobileAndTabletCheck()) 
                    yPos = System.Config.isPortrait(alerts) ? (85.4 / 100) * height : (87.5 / 100) * height;
        
                else 
                    yPos = System.Config.isLandscape(alerts) ? (87 / 100) * height : (87.5 / 100) * height;

                xPos = standardAspect ? ((55 / 100) * width) * percent : ((76 / 100) * width) * percent;

                if (xPos < (baseW - 5)) 
                    progressBarGraphics?.clear().fillStyle(0xff0000, 1).fillRoundedRect(standardAspect ? (70 / 100) * width : (62 / 100) * width, yPos, (48 / 100) * width * percent, 30, 2);
    
            });
        
            resources['assets'].forEach((resource: Object): void => {

                this.cache.preload.forEach(async (asset: string): Promise<void> => {

                    const key = String(Object.keys(resource)[0]),
                          path = String(Object.values(resource)[0]),
                          filetype = (await import ('./Utils')).default.strings.getFileType(path);   

                    //preload only assets used on this scene
                   
                    if (asset === key) 
                    {
                        switch (filetype) { 
                            case 'glb': await scene3d.third.load.gltf(key).then(data => this.cache.current.push({ key, data })); break;
                            case 'fbx': await scene3d.third.load.fbx(key).then(data => this.cache.current.push({ key, data })); break;
                        }
        
                        numAssets++;

                        if (numAssets >= this.cache.preload.length) 
                        {
                            setTimeout(() => res(alerts['stopAlerts']()), 1000);

                            progressBarGraphics?.destroy();
                            base?.destroy();
                            base2?.destroy();

                            return;
                        }
                    }

                });
            });
        });
    }


    //------------------------------ create map, player, controller, HUD



    public static async create(scene: ENABLE3D.Scene3D, levelKey: string, playerParams?: any[] | null, loadStage: boolean = true): Promise<void>  
    {
        return new Promise(async res => {

            scene.third.camera.lookAt(-10, 5, 10);

            //preload assets if cached object array is empty
           
            await this.loadAssets(scene['_scene'], scene);  

            this.backgroundFill.destroy();
            
            //load map before objects
      
            if (loadStage) {
                const { LevelManager3D } = await import ('../game/levelManager');
                await LevelManager3D.load(scene, levelKey);
            }

            System.Process.orientation.unlock();
 
            //init player / init controls

            if (playerParams) {
                const { Player3D } = await import ('../game/player');
                scene['player'] = new Player3D(scene, playerParams[0], playerParams[1], playerParams[2], playerParams[3], playerParams[4]);  
                scene['controller'].init(scene['player']); 
            }  

            //init hud display

            scene.scene.run('HUD3D', scene);
     
            //set post processing pipeline

            (await import ('../shaders/main')).ShaderManager.setPostProcessingBloom(scene, { bloomStrength: 0.5, bloomThreshold: 0, bloomRadius: 0.5 });

            //precompile shaders
            
            await scene.third.renderer.compileAsync(scene.third.scene, scene.third.camera);

            scene.cameras.main.fadeIn(4000, 0, 0, 0);

            res();
        });
    }


    //----------------------------- soft reset


    public static async reset(scene: ENABLE3D.Scene3D): Promise<void>
    {
        return new Promise(async res => {

            scene.sound.stopAll(); 
            scene.sound.removeAll();

            scene.scene.stop('HUD3D'); 

            if (scene.scene.manager.getScene('Alerts'))
                scene.scene.stop('Alerts');

            if (scene.scene.manager.getScene('Modal'))
                scene.scene.stop('Modal');

            this.cache.preload.length = 0;

            (await import ('../game/levelManager')).LevelManager3D.reset(scene);
            (await import ('../game/inventory/inventoryManager')).Inventory3D.reset();

            while (scene.third.scene.children.length > 0) {
                const obj = scene.third.scene.children[0];
                scene.third.scene.remove(obj);
            }

            scene.third.scene.clear();

            //remove the 3d stuff and reinit to make the old image go away

            const canvas = scene.third.renderer.domElement;

            if (canvas && canvas.parentNode) 
                canvas.parentNode.removeChild(canvas);
            
            res();
        });
    }


    //----------------------------------- destroy objects and third dimension


    public static async shutDown(scene: ENABLE3D.Scene3D): Promise<void>
    {
        await this.reset(scene);

        this.cache.current.length = 0;

        if (scene.scene.manager.getScene('Survival'))
            scene.scene.stop('Survival');

        if (scene.scene.manager.getScene('Sandbox3D'))
            scene.scene.stop('Sandbox3D');

        if (scene.scene.manager.getScene('SkeetShoot'))
            scene.scene.stop('SkeetShoot');

        if (scene.scene.manager.getScene('TheOven3D'))
            scene.scene.stop('TheOven3D');

        if (scene.scene.manager.getScene('Nexus3D'))
            scene.scene.stop('Nexus3D');

        if (scene.scene.manager.getScene('Freezer3D'))
            scene.scene.stop('Freezer3D');

        if (scene.scene.manager.getScene('MeatballMountain3D'))
            scene.scene.stop('MeatballMountain3D'); 

        if (scene.scene.manager.getScene('MelonLand3D_2D'))
            scene.scene.stop('MelonLand3D_2D'); 

        if (scene.scene.manager.getScene('HUD3D'))
            scene.scene.stop('HUD3D'); 

        if (scene.scene.manager.getScene('Menu3D'))
            scene.scene.stop('Menu3D'); 

        if (scene.scene.manager.getScene('Alerts'))
            scene.scene.stop('Alerts');

        scene.third.heightMap.scene.background = null;
        scene.third.renderer.setClearColor(0x000000, 1); 

        setTimeout(() => scene.clearThirdDimension(), 5000);
    }


    //------------------------------------- debug graphics

    
    public static toggleDebugGraphics(scene: ENABLE3D.Scene3D): void
    {
        scene.input.keyboard?.on('keydown-G', () => {

            this.debugGraphics = this.debugGraphics ? 
                false : true;

            this.debugGraphics ? 
                scene.third.physics.debug?.disable() : 
                scene.third.physics.debug?.enable();
        });
    }


    //--------------------------------- debug params

    
    public static toggleDebugParams(scene: ENABLE3D.Scene3D): void {
        scene.input.keyboard?.on('keydown-H', () => this.debugParams = !this.debugParams);
    }

}