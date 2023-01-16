
import { System } from '../internals/Config';
import { Boot } from '../preload/Boot';
import { Preload } from '../preload/Preload';
import { Background } from '../preload/Background.js';
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

        new Boot,
        new Preload, 
        new Background,
        new SkeetShoot


    ];

    public static async init (

        scene: Phaser.Scene, 
        playerArgs?: any[], 
        spawnEnemies?: boolean, 
        spawnPickups?: boolean

    ): Promise<void>    
    { 


    ////darken on pause 

        System.Process.app.gfx = scene.add.graphics({fillStyle: {color: 0x000000}}).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 30000, 30000)).setDepth(9000).setVisible(false);

    ////time of day

        System.Process.app.date = new Date();
        System.Process.app.hours = System.Process.app.date.getHours();

        System.Process.app.timeWarp = 1;
        System.Process.app.timeOfDay = System.Process.app.hours * System.Process.app.timeWarp; 

    ////reset screen state

        System.Process.app.game.fightBoss = false;
        System.Process.app.game.cutScene = false;

        System.Process.app.text['textType'] = 'dialog';  

    ////shaders 

      //  System.Process.app.shaders.init(scene);

    ////events 

       // System.Process.app.events.scene = scene;
    
    // //// map

    //     System.Process.app.maps.init(scene);

    // //// inventory
        
    //     System.Process.app.inventory.init(scene); 

    // ////cheats ?

    //     System.Process.app.cheats.applyAny(scene);

    // //spawn player / enemies / pickups

    //     System.Process.app.spawner.init(scene, playerArgs, spawnEnemies, spawnPickups);
    
    //collisions

    //     System.Process.app.physics.collisions.init(scene);

    // //camera fade in / set bounds / commonly used particles

    //     if (System.Process.app.maps.map !== null)
    //     {
    //         System.Process.app.cam.init(scene); 
    //         System.Process.app.particles.setCommon(scene);

    // //bullet cut off zones

    //         System.Process.app.zoneFront = scene.add.zone(0, 0, 50, 1500); 
    //         System.Process.app.zoneBack = scene.add.zone(0, 0, 50, 1500); 

    //         System.Process.app.game.groups.bulletZones.add(System.Process.app.zoneFront); 
    //         System.Process.app.game.groups.bulletZones.add(System.Process.app.zoneBack); 
    //     }

    //play music 

        System.Process.app.audio.music.play(scene); 


    } 
}