import * as ENABLE3D from '@enable3d/phaser-extension'
import { Game } from '../game/game'


export class EventManager 
{
    public static connected: boolean = false;
    public static RTCLerpValue: number = 0
    public static ee: Phaser.Events.EventEmitter | null = null
    public static scene: Phaser.Scene
    public static localMediaStream: MediaStream | null
    public static peers: Object = {}
    public static videos: { video: ENABLE3D.THREE.Mesh, element: HTMLVideoElement, id: string }[] = []

    //----------------------------------------- 


    public static isPaused(scene: Phaser.Scene): boolean 
    {
        return (scene.scene.manager.getScene('PauseMenu') && scene.scene.get('PauseMenu').scene.settings.active) ||
               (scene.scene.manager.getScene('Menu3D') && scene.scene.get('Menu3D').scene.settings.active) ||
               (scene.scene.manager.getScene('WarpMenu') && scene.scene.get('WarpMenu').scene.settings.active);
    }
 
    //---------------------------------------- return to game


    public static async returnToGame (scene: Phaser.Scene, _this: Phaser.Scene, spawnPoint: string, currentStage: string, sceneKey: string): Promise<void>
    {
        Game.gameState = false;

        scene.sound.stopAll(); 
        scene.sound.removeAll();
        
        _this.data['spawnPoint'] = spawnPoint; 
        _this.data['currentStage'] = currentStage;

        if (this.scene.scene.manager.getScene('Quest'))
            this.scene.scene.start('Quest', _this.data);

        if (this.scene.scene.manager.getScene('Modal'))
            this.scene.scene.stop('Modal');

        if (this.scene.scene.manager.getScene('Background'))
            this.scene.scene.stop('Background');

        if (this.scene.scene.manager.getScene('Menu3D'))
            this.scene.scene.stop('Menu3D');

        if (this.scene.scene.manager.getScene('PauseMenu'))
            this.scene.scene.stop('PauseMenu');
    
        scene.scene.stop(sceneKey);
        
    }

    
    //---------------------------------------- quit game


    public static quitGame(): void
    {
        Game.gameState = false;

        this.ee?.emit('exit');
    }


    //---------------------------------------- init in-game events


    public static init (scene: Phaser.Scene): void
    {
        if (this.ee !== null)
            return;
        
        this.scene = scene;
        this.ee = scene.events;

        //event library

        this.ee
        
        .on('exit', async () => { 

            this.scene.tweens.killAll();

           (await import (`./Clock`)).Clock.stopTimer();

            if (this.scene.scene.manager.getScene('BassUI'))
                this.scene.scene.get('BassUI')['resetParts']();
            
            //exit main game

            this.stopCommon();

            if (this.scene.scene.manager.getScene('Menu3D'))
                this.scene.scene.stop('Menu3D'); 

            if (this.scene.scene.manager.getScene('Alerts'))
                this.scene.scene.stop('Alerts'); 

        });
    }

    //---------------------------------------- stop common


    private static stopCommon(): void
    {
        Game.gameState = false;

        this.scene.sound.stopAll(); 
        this.scene.sound.removeAll(); 
        
        const keys = [
            'SeaShell_MiniGame',
            'Bubble_MiniGame',
            'Racing_MiniGame',
            'Quest',
            'Brawl',
            'DeathMatch',
            'JamSesh',
            'HUD',
            'Modal',
            'Controller',
            'Background',
            'TextUI',
            'Chat',
            'Credits',
            'GameOver'
        ];

        keys.forEach(key => {
            if (this.scene.scene.manager.getScene(key)) 
                this.scene.scene.stop(key);
        });
    }

}

