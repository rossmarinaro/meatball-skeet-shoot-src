/* AUDIO */

import { System } from './Config';


export class AudioManager {

    private default: boolean = false;
    private sound: any;
    private cached: string[] = [];

    public noAudio: boolean = false;

    public music = {

        track: '',

        fadeIn: (src: string, vol: number, scene: any) => {

            for (let music of scene.sound.sounds) 
                if (music.key === System.config.audio.music.track) 
                    scene.tweens.add({ targets: music, volume: { value: 0, ease: 'Power1', duration: 500 }});
            let obj = scene.sound.add(src).setLoop(true).setVolume(0);
            scene.tweens.add({ targets: obj, volume: { value: vol, ease: 'Power1', duration: 3000}, onStart: ()=> obj.play()});
        },

        fadeOut: (src: string, vol: number, scene: any) => {

            for (let music of scene.sound.sounds) 
            {
                if (music.key === src)
                { 
                    scene.tweens.add({targets: music, volume: { value: 0, ease: 'Power1', duration: 3000 },  
                    onComplete: () => {
                        System.config.audio.music.play(scene);
                        scene.tweens.add({ targets: music, volume: { value: vol, ease: 'Power1', duration: 3000 }})
                        music.stop();
                        scene.sound.removeByKey(music); 
                    }});
                }
            }
        },

        play: async (scene: Phaser.Scene) =>{ 

            const getStage = async ()=> {

                return 'phryg1';
                
            }

            const track = await getStage();

            System.config.audio.music.track = track;
            
            let src = scene.sound.add(track)['setLoop'](true).setVolume(0.8);
            src.play();
        }
    };

    //-------------------------------------------------------------------------

    constructor() 
    {
        this.noAudio = false;
        this.default = false;
        this.sound = null;
        this.cached = [];
    };

    public play (src: string, vol: number, loop: boolean, scene: Phaser.Scene, detune: number): void
    {
        System.config.audio.cached.push(src);
        System.config.audio.cached.filter((e: string) => { 
        System.config.audio.sound = scene.sound.add(src);
        System.config.audio.sound.setLoop(loop).setVolume(vol).setDetune(detune);

    //if sound is already in cache, remove it

            if (e.toString() === src) 
                System.config.audio.cached.pop(src);
            System.config.audio.sound.play();  
        });
    }

    public stop (src: string, scene: any): void 
    { 
        for (let snd of scene.sound.sounds) 
            if (snd.key == src) 
                snd.stop();
    }
}