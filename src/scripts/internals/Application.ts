///**** APPLICATION LEVEL CONFIG ***////  

import * as types from '../../../typings/types'

import { Config, System } from './Config';
import { AudioManager } from './Audio';
import { AjaxManager } from '../ajax.js';
import { Boot } from '../preload/Boot.js';
import { Preload } from '../preload/Preload.js';
import { Background } from '../preload/Background.js';
import { TargetPractice } from '../game/main';


export default class Application {

    public ajax: AjaxManager
    public audio: AudioManager
    public scale: any
    public pipeline: any[]

    public isPreloaded: types.isPreloaded
    public multiPlayer: types.multiPlayer
    public account: types.account

    
    private type: number
    private physics: any
    private transparent: boolean
    private parent: string
    private backgroundColor: string
    private dom: { createContainer: boolean }
    private scene: Phaser.Scene[]
    private input: types.input



//-----------------------------------------------------------

    constructor(system: Config)
    {  
        
        this.ajax = new AjaxManager;
        this.audio = new AudioManager;


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
            new TargetPractice

        ];



      
    }
   
    
}

        

