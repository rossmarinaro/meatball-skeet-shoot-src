import * as ENABLE3D from '@enable3d/phaser-extension'
import { System } from '../internals/Config'

import { SkeetShoot } from '../game/main'
import { ShaderManager } from '../shaders/main'
import { AudioManager } from '../internals/Audio'


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

    public static async initWorld (scene: Phaser.Scene): Promise<void>    
    { 


    //darken on pause 

        System.Process.app.gfx = scene.add.graphics({fillStyle: {color: 0x000000}}).fillRectShape(new Phaser.Geom.Rectangle(0, 0, 30000, 30000)).setDepth(9000).setVisible(false);

    //time of day

        const date = new Date(),
        hours = date.getHours();
        System.Process.app.timeOfDay = hours;

        AudioManager.music.play(scene); 


    } 

    //---------------------------------------------------- update generic

    public static preUpdate(scene: Phaser.Scene | ENABLE3D.Scene3D): void
    {
        if (scene.scene.settings.active)
        {
            scene.scene.sendToBack('Background');

            //bring interfaces to top of scene stack

            const interfaces = [ 
                'SV_UI', 
                'BassUI', 
                'SamplerUI', 
                'Controller',
                'HUD', 
                'HUD3D',  
                'TextUI', 
                'Alerts', 
                'Chat',
                'PauseMenu', 
                'Menu3D'
            ];

            interfaces.forEach(key => {
                if (scene.scene.manager.getScene(key) && scene.scene.isActive(key)) 
                    scene.scene.bringToTop(key);
            });

            //3d scene
            
            if (scene instanceof ENABLE3D.Scene3D)
            {
                if (!scene.third)
                    return;

                //update shaders

                ShaderManager.shaderMaterials.forEach((shader: ENABLE3D.THREE.ShaderMaterial) => {
                    if (shader.uniforms.time)
                        shader.uniforms.time.value += 0.01;
                });

                //log collisions

                // this.third.physics.collisionEvents.on('collision', data => {
                //   const { bodies, event } = data
                //   console.log(bodies[0].name, bodies[1].name, event)
                // });

                //update mobile canvas on resize

                if (!System.Config.isDesktop(scene))
                { 
                    scene.third.camera['far'] = 4000;
                    scene.third.camera.updateProjectionMatrix();
                    scene.third.renderer.setSize(innerWidth, innerHeight);
                    scene.third.renderer.shadowMap.enabled = true;
                    scene.third.renderer.shadowMap.type = ENABLE3D.THREE.PCFSoftShadowMap;
                }

                else { //2d scene

                }
            }
        }
    }
}