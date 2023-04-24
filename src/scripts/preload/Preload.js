

import { parseResources } from '../internals/parser';
import { THREE } from '@enable3d/phaser-extension';

export class Preload extends Phaser.Scene {
    
	constructor() {

	    super("Preload");
    
	}


//---------------------

	init(data)
    {
		this.data = data;
		this.data.currentStage = 'Assets'; 
       

	}

//-----------------

	async preload()
    {   


    //---- call asset preload funcs

       await parseResources(this, this.cache.json.get('resources_main')); 


        this.load.on('progress', value =>{

        // destroy progress bar

            if (parseInt(value * 100) + '%' === '100%')
                this.time.delayedCall(1000, ()=> {
                    this.scene.run('SkeetShoot', [this, 1]);
                    this.scene.stop('Preload');
                });  

        });
    }

    
    //----------------------------------------------- 3d


    async loadAssets (scene, scene3d) 
    {

        return new Promise(async res => {
            
           if (System.Process.app.ThirdDimension.cache.length > 0)
                res();

            THREE.Cache.enabled = true;

            const hud = scene3d.scene.get('HUD3D');

            hud['alert']('large', 'Loading assets...', 'please wait');

            let numAssets = 0;

            const resources = await parseResources(scene3d, scene.cache.json.get('resources_3d'));

            resources['assets'].map(async (resource) => {
    
                const key = String(Object.keys(resource)[0]),
                      path = String(Object.values(resource)[0]),
                      filetype = System.Config.utils.strings.getFileType(path);  

                switch (filetype)
                {
                    case 'glb': await scene3d.third.load.gltf(key).then(data => System.Process.app.ThirdDimension.cache.push({ key: key, data })); break;
                    case 'fbx': await scene3d.third.load.fbx(key).then(data => System.Process.app.ThirdDimension.cache.push({ key: key, data })); break;
                }

                numAssets++;

                if(numAssets >= resources['assets'].length)
                {

                    hud['stopAlerts']();

                    setTimeout(()=> res(), 500);
                }
    
            });
    
        });
    }



}




