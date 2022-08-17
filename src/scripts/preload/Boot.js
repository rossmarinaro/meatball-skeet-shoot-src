/* BOOT */
import resources_main from './resources/main.json';
import resources_3d from './resources/3d.json';
import JoyStick from '../plugins/joystick.js';
import Utils from '../internals/Utils';


export class Boot extends Phaser.Scene { 

        constructor() {
            super("Boot");      
        }
        
    //---------------------- initialize 

        async init() 
        {
            

            this.scene.run('Background', 'blank');

        //utilities

            System.utils = new Utils;
            
        //game scale 

            System.config.scale.scaleWidth = this.scale.width; 
            System.config.scale.scaleHeight = this.scale.height;
            System.config.scale.scaleRatio = System.config.scale.scaleWidth / System.config.scale.scaleHeight * 0.9; 
             
        }
        async preload()
        {
            //// assets
                this.load.json('resources_main', resources_main);
                this.load.json('resources_3d', resources_3d);

            ////plugins

                this.load.plugin('rexvirtualjoystickplugin', JoyStick, true);
        }
        
    //------------------------------- run preload scene

       async create()
        {   
            this.add.text(0, 0, '', { font: "1px Digitizer", fill: ''}).setAlpha(0);
            this.add.text(0, 0, '', { font: "1px Bangers", fill: ''}).setAlpha(0);
            this.time.delayedCall(500, ()=> {
                
               this.scene.run('Preload', this.data);

                this.scene.stop('Boot');

            });
        }
    }


   