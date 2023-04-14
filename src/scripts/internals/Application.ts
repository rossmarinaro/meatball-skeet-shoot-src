///**** APPLICATION LEVEL CONFIG ***////  

import * as types from '../../../typings/types'

import { System } from './Config';
import { Game } from '../game/game';
import { AudioManager } from './Audio';
import { AjaxManager } from './Ajax';
import { ShaderManager } from '../shaders/main';
import { Boot } from '../preload/Boot.js';
import { Preload } from '../preload/Preload.js';
import { Background } from '../preload/Background.js';
import { Text, TextUI } from './Text';
import { ThirdDimension } from './ThirdDimension';
import { EventManager } from './Events';


export default class Application {

    public game: typeof Game = Game
    public ajax: typeof AjaxManager = AjaxManager
    public audio: typeof AudioManager = AudioManager
    public events: typeof EventManager = EventManager
    public shaders: typeof ShaderManager = ShaderManager
    public text: typeof Text = Text
    public ThirdDimension: typeof ThirdDimension = ThirdDimension
    public scale: any
    public pipeline: any[]

    public isPreloaded: types.isPreloaded
    public multiPlayer: types.multiPlayer
    public account: types.account
    public timeOfDay: Readonly<number>   
    
    private type: number
    private physics: any
    private transparent: boolean
    private parent: string
    private backgroundColor: string
    private dom: { createContainer: boolean }
    private scene: Phaser.Scene[]
    private input: types.input



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
            new TextUI,
            ...Game.scene 
        ];
    }

}

        

