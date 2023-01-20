
import { System } from '../internals/Config';

import { SkeetShoot } from '../game/main';


export class Game {
 
    public static matterEnemies: Phaser.Physics.Matter.Sprite[]
    public static enemies: Phaser.GameObjects.Group[] 
    public static spawns: Phaser.GameObjects.GameObject[]

    public static groups?: any
    public static groundArray: any[]
    public static gameState: boolean = false
    public static gameSaved: boolean = false

    public static cutScene: boolean = false
    public static interact: boolean = false
    public static fightBoss: boolean = false


    public static scene: Phaser.Scene[] = [

        new SkeetShoot

    ];

    public static async init (scene: Phaser.Scene): Promise<void>    
    { 


    ////darken on pause 

        System.Process.app.gfx = scene.add.graphics({fillStyle: {color: 0x000000}}).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 30000, 30000)).setDepth(9000).setVisible(false);

    ////time of day

        System.Process.app.date = new Date();
        System.Process.app.hours = System.Process.app.date.getHours();

        System.Process.app.timeWarp = 1;
        System.Process.app.timeOfDay = System.Process.app.hours * System.Process.app.timeWarp; 

        System.Process.app.text['textType'] = 'dialog';  

    //play music 

        System.Process.app.audio.music.play(scene); 


    } 
}