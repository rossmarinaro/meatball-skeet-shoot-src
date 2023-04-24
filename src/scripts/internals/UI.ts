//------------------------- BASE UI CLASS

import { System } from './Config';


export class UI {

    private static canResize: boolean

//-----------------------------------------------------------


    public static listen (scene: Phaser.Scene, key: string, callback?: Function): void
    {

        UI.canResize = true;
   
        const 
            _resize = (scene: Phaser.Scene, key: string) => {

                if (!UI.canResize)
                    return;

                scene.scene.settings.visible = false;   //disable scene visibility / call resize method
                    
                System.Process.app.ui.resize(scene, key);
                
                if (callback)
                    callback(scene);
            },
            _resizeCheck = (scene: Phaser.Scene, key: string) => {
                if (scene.scene.settings.active) 
                    _resize(scene, key);
            };

        _resize(scene, key);

        scene.scale.on('resize', ()=> _resizeCheck(scene, key), scene);
        screen.orientation?.addEventListener('change', ()=> _resizeCheck(scene, key), false);
        screen.orientation?.addEventListener('webkitfullscreenchange', ()=> _resizeCheck(scene, key), false);
    }

    //-----------------------------------------------------------


    public static stop (scene: Phaser.Scene): void
    {
        
        UI.canResize = false;

        const w = scene.scale.width,
              h = scene.scale.height;

        scene.cameras.main?.setViewport(0, 0, w, h).setZoom(1).centerOn(w / 2, h / 2);

        screen.orientation?.removeEventListener('change', ()=> {}, false);
        screen.orientation?.removeEventListener('webkitfullscreenchange', ()=> {}, false);
    }


    //-------------------------------------------------------------


    public static resize(scene: Phaser.Scene, key: string): void
    {
    
        const orientation = UI.checkOrientation(scene, key); 

        if (!orientation)
            return;
        
        scene['GAME_WIDTH'] = orientation[0];
        scene['GAME_HEIGHT'] = orientation[1];
        
        UI.callSizer(scene);

        setTimeout(async ()=> {

            const position: any = await UI.getPosition(scene, key);

            if (position)
                UI.setCamera(scene, position[0], position[1], position[2]);

        }, 300);
    }

    
//-----------------------------------------------------------

    private static callSizer (scene: Phaser.Scene): Phaser.Structs.Size
    {
        return (
            scene['parent'] = new Phaser.Structs.Size(scene.scale.gameSize.width, scene.scale.gameSize.height).setSize(scene.scale.gameSize.width, scene.scale.gameSize.height),
            scene['sizer'] = new Phaser.Structs.Size(scene['GAME_WIDTH'], scene['GAME_HEIGHT'], Phaser.Structs.Size.FIT, scene['parent']).setSize(scene.scale.gameSize.width, scene.scale.gameSize.height)
        );
    }

//-----------------------------------------------------------

    private static checkOrientation (scene: Phaser.Scene, key: string): [number, number] | undefined
    {

        return[
            !System.Config.isDesktop(scene) && System.Config.isLandscape(scene) ? 1400 : scene.scale.width,
            !System.Config.isDesktop(scene) && System.Config.isLandscape(scene) ? 1800 : scene.scale.height
        ];

    }


//------------------------------------------------------------

    private static async getPosition (scene: Phaser.Scene, key: string): Promise<[number, number, boolean] | undefined>
    {

        if (System.Config.isDesktop(scene))
            return[scene['GAME_WIDTH'] / 2, scene['GAME_HEIGHT'] / 3.5, false];
        else
            return[
                System.Config.isLandscape(scene) ? 180 : scene['GAME_WIDTH'] / 2, 
                System.Config.isLandscape(scene) ? scene['GAME_HEIGHT'] / 2 : scene['GAME_HEIGHT'] / 3.5, 
                false
            ];
        
    }

//-------------------------------------------------------------

    private static setCamera (scene: Phaser.Scene, x: number, y: number, pos: boolean): void
    {
        if (pos === true)
        {
            const posX = System.Config.isDesktop(scene) ? 40 : scene['GAME_HEIGHT'] > 400 ? 140 : scene['GAME_WIDTH'] / 2 - 150;

            scene.cameras.main.setPosition(posX, screenTop);

            if (!System.Config.isDesktop(scene))
                scene.cameras.main.setZoom(
                    Math.min(
                        scene['sizer'].width / scene['GAME_WIDTH'], 
                        scene['sizer'].height / scene['GAME_HEIGHT']
                    )
                );
        }
        else 
        {
            if (scene.cameras.main)
                scene.cameras.main
                    .setViewport(Math.ceil((scene['parent'].width - scene['sizer'].width) * 0.5), screenTop, scene['sizer'].width, scene['sizer'].height)
                    .setZoom(Math.max(scene['sizer'].width / scene['GAME_WIDTH'], scene['sizer'].height / scene['GAME_HEIGHT']))
                    .centerOn(x, y);
        }

    //make scene visible
    
        scene.scene.settings.visible = true;
    }



}

