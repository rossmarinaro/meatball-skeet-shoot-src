/* BOOT */
import resources_main from './resources/main.json';
import resources_3d from './resources/3d.json';
import JoyStick from '../plugins/joystick.js';



export class Boot extends Phaser.Scene { 

        constructor() {
            super("Boot");      
        }
        
    //---------------------- initialize 

        async init() 
        {
            

            this.scene.run('Background', 'blank');
            
        //game scale 

            System.Process.app.scale.scaleWidth = this.scale.width; 
            System.Process.app.scale.scaleHeight = this.scale.height;
            System.Process.app.scale.scaleRatio = System.Process.app.scale.scaleWidth / System.Process.app.scale.scaleHeight * 0.9; 
    
        //call full screen if available
    
            this.input.on('pointerup', () => {
                if (!this.scale.isFullscreen && this.scale.fullscreen.available)
                {   
                    this.scale.fullscreenTarget = document.getElementById(System.Process.app.parent);    
                    this.scale.startFullscreen();
                }
            });
             
        }
        async preload()
        {
        // assets
            this.load.json('resources_main', resources_main);
            this.load.json('resources_3d', resources_3d);

        //plugins

            this.load.plugin('rexvirtualjoystickplugin', JoyStick, true);
        }
        
    //------------------------------- run preload scene

       async create()
        {   
            this.add.text(0, 0, '', { font: "1px Digitizer", fill: ''}).setAlpha(0);
            this.add.text(0, 0, '', { font: "1px Bangers", fill: ''}).setAlpha(0);

                this.scene.run('Preload', this.data);
                this.scene.run('Alerts', this);

        }
    }


   