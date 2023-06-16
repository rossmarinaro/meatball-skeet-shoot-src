///**** APPLICATION LEVEL CONFIG ***////  

import * as types from '../../../typings/types'

import { System } from './Config';
import { Game } from '../game/game';
import { AudioManager } from './Audio';
import { AjaxManager } from './Ajax';
import { ShaderManager } from '../shaders/main';
import { ResourceManager } from './Resource'

import { Boot } from '../preload/Boot';
import { Preload } from '../preload/Preload';
import { Background } from '../preload/Background';
import { Text, TextUI } from './Text';
import { ThirdDimension } from './ThirdDimension';
import { EventManager } from './Events';
import { HUD3D } from '../game/hud';
import { UI } from './UI';
import { Alerts } from './alerts'


export default class Application {

    public resource: typeof ResourceManager = ResourceManager 
    public game: typeof Game = Game
    public ajax: typeof AjaxManager = AjaxManager
    public audio: typeof AudioManager = AudioManager
    public events: typeof EventManager = EventManager
    public shaders: typeof ShaderManager = ShaderManager
    public text: typeof Text = Text
    public ThirdDimension: typeof ThirdDimension = ThirdDimension

    public ui: typeof UI = UI
    public gfx: Phaser.GameObjects.Graphics

    public scale: any
    public pipeline: any[]

    public isPreloaded: types.isPreloaded
    public multiPlayer: types.multiPlayer
    public account: types.account
    public timeOfDay: Readonly<number>   
    
    public type: number
    public physics: any
    public transparent: boolean
    public parent: string
    public backgroundColor: string
    public dom: { createContainer: boolean }
    public scene: Phaser.Scene[]
    public input: types.input



//----------------------------------------------------------

    constructor(system: System.Config)
    {  

        this.type = Phaser.WEBGL;
        this.transparent = true,
        this.parent = 'game';
        this.scale = {
            mode: system.mode,
            autoCenter: system.position,
            width: system.width,
            height: system.height,
            min: {
                width: system.min.width,
                height: system.min.height
            },
            max: {
                width: system.max.width,
                height: system.max.height
            },
            scaleRatio: 0,
            parentBottom: null, 
            sizerBottom: null
        };
        this.dom = {
            createContainer: true,
            //modal: null
        };
        this.input = {
            virtual: true,
            gamepad: true,
            type: system.inputType,
            mode: 'A'
        };
        this.physics = {
            default: 'arcade'
        };

    //--------------------array of stages / minigames within the game

        this.scene = [ 
            new Boot,
            new Preload, 
            new Background,
            ...Game.scene,
            new HUD3D, 
            new TextUI,
            new Alerts
        ];
    }

}


//------------ APPLICATION ENTRY POINT ---------------------//


window.onload = async () => System.Process.app = new Application(System.Process); 



//window.onerror = function(err, url, line){
//alert(`${err}, \n ${url}, \n ${line}`);
    //window.location.reload();
//     return true;
// } 

        

