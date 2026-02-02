
import { System } from '../internals/Config';
import { parseResources } from '../internals/parser';


export class Preload extends Phaser.Scene {


	constructor()  { 
        super('Preload');
    
	}


//--------------------------

	private init(data: Phaser.Scenes.Systems | any): void
    {
        
		this.data = data;
		this.data['currentStage'] = 'Assets'; 
        this.scene.launch('Background', {type: 'blank'});

        System.Process.orientation.lock('portrait-primary');

	}

//-------------------------------

	private preload(): void
    {   


    //---- call asset preload funcs

       this.parse(this); 
       
	}

//-------------------------------

    private create(): void 
    {
    
        this.scene.run('SkeetShoot', [this, 1]);
        this.scene.stop('Preload');
    }


//--------------------- parse json asset manifests


    private async parse(scene: Phaser.Scene): Promise<void>
    {
        await parseResources(scene, scene.cache.json.get('resources_main')); 
        await parseResources(scene, scene.cache.json.get('resources_3d'));
    }



}




