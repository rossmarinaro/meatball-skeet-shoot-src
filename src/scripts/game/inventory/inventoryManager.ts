import * as types from '../../../../typings/types';
import * as ENABLE3D from '@enable3d/phaser-extension';

import { System } from '../../internals/Config';

import { PlayerItem } from './playerItem';


export class Inventory3D {

    private static weapons: string[] = ['rolling_pin1', 'penne_pistol', 'automac1000']
    private static powerups: string[] = ['ikura_maki_tile']
    private static selections: string[] = [...Inventory3D.weapons, ...Inventory3D.powerups]
    private static currentInventory: string[] = []

    public static currentSelection: string = ''

    public static ammo: types.ammo = {
        automac1000: 0,
        penne_pistol: 0,
        rigatoni_rocket_launcher: 0,
        grenade: 0,
        dynamite: 0 
    }

//------------------------------------------------ reset ammo

    public static resetAmmo (base: number): void
    {
        Inventory3D.ammo = {
            automac1000: base,
            penne_pistol: base,
            rigatoni_rocket_launcher: base,
            grenade: base,
            dynamite: base
        }
    }

//------------------------------------------------ get item / pickup

    public static async aquirePickup (

        scene: ENABLE3D.Scene3D, 
        obj: ENABLE3D.ExtendedObject3D

    ): Promise<void>
    {
        
        if (obj.hasBody && Inventory3D.selections.includes(obj['key']))
        {

            System.Process.app.audio.play('macaroni_ring', 1, false, scene, 0);

            const str = await System.Process.utils.strings.removeJunk(obj['key']),
                  article = await System.Process.utils.strings.checkVowel(str),
                  player = scene['player'];

            scene['hud'].alert('small', `You picked up ${article} ${str}`);

            if (Inventory3D.powerups.includes(obj['key']))
                player.initPowerup(obj['key']);
            
            if (Inventory3D.weapons.includes(obj['key']))
            {
                const doesExist = await Inventory3D.checkDoesExist(obj); 
                
                if (doesExist)
                    Inventory3D.increment(scene, obj);
                else  
                {
    
                    System.Process.app.audio.play('sick', 1, false, scene, 0);
                
                    scene.data['weapons'].push(obj['key']);
    
                    player.currentEquipped.obj.remove(player.currentEquipped.obj.children[0]);

                    Inventory3D.increment(scene, obj);
                    Inventory3D.setItem(scene, obj['key']);
                    
                }
            }

            System.Process.app.events.socketEmit('DEATHMATCH: collected pickup', { key: obj['key'], id: obj['_id'] });

            obj.remove(obj.children[0]);
            scene['third'].physics.destroy(obj);

        }
    }

//------------------------------ set item

    public static async setItem(scene: ENABLE3D.Scene3D, item: string): Promise<void>
    {

        System.Config.vibrate(20);

        if (Inventory3D.currentSelection === item)
            return;
        
        const player = scene['player'],

        applySelection = async (): Promise<[number, boolean] | null> => {

            switch (item)
            {
                case 'rolling_pin1' : 
                    return [0, false];
                case 'penne_pistol' :
                    return [Inventory3D.ammo.penne_pistol, true];
                case 'automac1000' : 
                    return [Inventory3D.ammo.automac1000, true]; 
                default: return null;
            }
        },

        selection = await applySelection();
        
        if (selection !== null)
        {
            if (player.currentEquipped.obj !== null)
                player.currentEquipped.obj.remove(player.currentEquipped.obj.children[0]);
                
            player.currentEquipped.key = item;
            player.currentEquipped.quantity = selection[0];
            player.currentEquipped.obj = null;
            player.currentEquipped.obj = new PlayerItem(scene, item, selection[1]); 
            player.swapItem({item: {key: item}});
        }

        Inventory3D.currentSelection = item;

        System.Process.app.events.socketEmit('DEATHMATCH: item swap', { key: item });
    }



//------------------------------- remove player's first person accessory

    public static setAsStandAloneItem (

        target: ENABLE3D.ExtendedObject3D, 
        child: ENABLE3D.ExtendedObject3D

    ): void
    {
    
        switch(target['key'])
        {
            case 'rolling_pin1': 
                Inventory3D.checkObjNames(child, 'arm', 'glove');
                target.scale.set(3, 3, 3);
            break;
            case 'penne_pistol': 
                Inventory3D.checkObjNames(child, 'arm', 'glove', 'muzzle');
                target.scale.set(6.1, 6.1, 6.1);
                target['capacity'] = 10;
            break;
            case 'automac1000': 
                Inventory3D.checkObjNames(child, 'arm', 'glove', 'muzzle');
                target.scale.set(5, 5, 5);
                target['capacity'] = 30;
            break;
            case 'ikura_maki_tile':
                target.scale.set(2, 2, 2);
            break;
        }
    }

    //--------------------------------- set third person weapon

    public static setItemForThirdPerson (

        target: ENABLE3D.ExtendedObject3D, 
        child: ENABLE3D.ExtendedObject3D

    ): void
    {
    
        switch(target['key'])
        {
            case 'rolling_pin1': 
                target.scale.set(3, 3, 3);
                Inventory3D.checkObjNames(child, 'arm', 'glove'); 
            break;
            case 'penne_pistol': 
            case 'automac1000':
                target.scale.set(5, 5, 5);
                Inventory3D.checkObjNames(child, 'arm', 'glove', 'muzzle'); 
            break;
        }
    }

//------------------------------- decrement


    public static decrement (scene: ENABLE3D.Scene3D, type: string, subject: string): void
    {
        Inventory3D[type][subject]--; 
        scene['player'].currentEquipped.quantity = Inventory3D[type][subject];
    }

//---------------------------------- increment


    private static async increment(
        
        scene: ENABLE3D.Scene3D, 
        obj: ENABLE3D.ExtendedObject3D
        
    ): Promise<void>
    {
        const key = obj['key'], 
        
            currentEquipped = scene['player'].currentEquipped, 
        
            getInventory = async () => {

                switch (key)
                {
                    case 'automac1000': 
                        return Inventory3D.ammo.automac1000 += obj['capacity']; 
                    case 'penne_pistol': 
                        return Inventory3D.ammo.penne_pistol += obj['capacity']; 
                    default: return;
                }
            },

        inventory = await getInventory();

        if (inventory && currentEquipped.key === key)
            currentEquipped.quantity = inventory; 
    }


//------------------------------------------------- check names and set visibility to false


    private static checkObjNames(child: ENABLE3D.ExtendedObject3D, argA?: string, argB?: string, argC?: string): void
    {
        if (
            child.name === argA || 
           (argB && child.name === argB) || 
           (argC && child.name === argC)
        )
        child.visible = false;
    }

    
//------------------------------------------------ check if item exists


    private static async checkDoesExist (obj: ENABLE3D.ExtendedObject3D): Promise<boolean>
    {
        if (Inventory3D.currentInventory.includes(obj['key']))
            return true;
        
        Inventory3D.currentInventory.push(obj['key']);
        return false;
    }

}