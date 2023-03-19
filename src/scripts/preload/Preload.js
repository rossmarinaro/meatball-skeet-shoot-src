

import { parseResources } from '../internals/parser';

export class Preload extends Phaser.Scene {
	constructor() {

	    super("Preload");
 
        this.stageText = {};  
        this.assetText = {};
        this.percentText = {}; 
        this.loadingText = {}; 
        this.progressBarGraphics = {};     
        this.progressBox = {}; 
        this.progressBox2 = {};
        this.progressOverlay = {};
        this.loadIterator = {};

    
	}

    async preload3D (scene, scene3d) 
    {
        scene.scene.launch('Background', 'blank');
        await parseResources(scene3d, scene.cache.json.get('resources_3d'));
        setTimeout(()=> scene.scene.stop('Background'), 1000);
    }


//----------------------------------------------------------------------------------------------------------------

	init(data)
    {
		this.data = data;
		this.data.currentStage = 'Assets'; 
       

	}

//----------------------------------------------------------------------------------------------------------------

	preload()
    {   


    //---- call asset preload funcs

       parseResources(this, this.cache.json.get('resources_main')); 
       parseResources(this, this.cache.json.get('resources_3d'));

	//---- progress bar   

		this.progressBar(this);
	}


//---------------------------------------------------------------------------------- progress bar

    progressBar(scene)
    { 

        const 
            width = this.GAME_WIDTH / 2, 
            height = this.GAME_HEIGHT / 2;

        this.progressBox = scene.add.graphics().fillStyle(0xffff00, 1).fillRoundedRect((55 / 100) * width, (85 / 100) * height, (85 / 100) * width, 50, 10);
        this.progressBox2 = scene.add.graphics({lineStyle: {width: 3, color: 0xff0000}}).strokeRoundedRect((55 / 100) * width, (85 / 100) * height, (85 / 100) * width, 50, 10);
        this.progressBarGraphics = scene.add.graphics();
        this.progressOverlay = scene.add.graphics().fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0, 0.2, 0.3, 0.1).fillRoundedRect((55 / 100) * width, (85 / 100) * height, (85 / 100) * width, 50, 10);
        this.loadingText = scene.make.text({
            x: width,
            y: height / 2 - 100,
            text: 'Loading',
            style: {font: '50px Digitizer', fill: '#ff0000' }
        }).setStroke('#FFB000', 4).setShadow(2, 2, '#ffff00', true, false).setOrigin(0.5, 0.5);   
        this.stageText = scene.make.text({
            x: width,
            y: height / 2 - 30,
            text: this.data.currentStage,
            style: { font: '20px Digitizer', fill: '#ffffff' }
        }).setStroke('#FF0000', 4).setOrigin(0.5, 0.5);
        this.percentText = scene.make.text({ 
            x: width,
            y: height / 2 + 30,
            text: '0%',
            style: {font: '38px Digitizer', fill: '#0CC10C' }
        }).setStroke('#FFB000', 4).setShadow(2, 2, '#ffff00', true, false).setOrigin(0.5, 0.5);
        this.assetText = scene.make.text({
            x: width,
            y: height / 2 + 75,
            text: '',
            style: { font: '12px Digitizer', fill: '#ffff00' }
        }).setStroke('#0CC10C', 2).setOrigin(0.5, 0.5);

    //// on progress / complete

        let dots = '';
        const updateLoad = ()=>{

            if (!this.loadIterator)
                return;

            dots += '.';
            let text = 'Loading.', 
                positionX = this.loadingText.x;
            if (this.loadingText._text !== 'Loading...')
            {
                text = `Loading${dots}`
                positionX = this.loadingText.x += 5;
            }
            else 
            {
                dots = '.';
                positionX = width + 5.27;
            }
            this.loadingText.setText(text).setX(positionX);
        };
        this.loadIterator = this.time.addEvent({delay: 1000, callback: updateLoad, callbackScope: this, repeat: -1});

        scene.load.on('progress', value =>{
            this.percentText.setText(parseInt(value * 100) + '%');
            this.progressBarGraphics.clear();    
            this.progressBarGraphics.fillGradientStyle(0xff0000, 0xff0000, 0xFCB144, 0xFCB144, 1).fillRoundedRect((60 / 100) * width, (87.4 / 100) * height, (76 / 100) * width * value, 30, 2);
    //// destroy progress bar
            if (this.percentText._text === '100%')
                System.Process.gameState === true ? 
                    this.destroyProgressBar() : scene.time.delayedCall(3000, ()=> this.destroyProgressBar());  
        })
        .on('fileprogress', file => this.assetText.setText(file.key)); 
    }
//---------------------------------------------------------------------------------------- destroy progress bar

    destroyProgressBar()
    {
        this.loadIterator.destroy();
        this.progressBarGraphics.destroy();
        this.progressOverlay.destroy();
        this.progressBox.destroy();
        this.progressBox2.destroy();
        this.loadingText.destroy();
        this.percentText.destroy();
        this.stageText.destroy();
        this.assetText.destroy();

        this.scene.run('SkeetShoot', [this, 1]);
    }

    
//-----------------------------------------------------------------------------------------------------------------



}




