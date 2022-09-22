import * as types from '../../../typings/types';
import { Scene3D, ExtendedObject3D } from '@enable3d/phaser-extension';
import { System } from '../internals/Config';

import { Automac1000 } from './rifle';


export class Inventory3D {

    private static weapons: string[] = ['rolling_pin1', 'automac1000']
    private static powerups: string[] = ['ikura_maki_tile']
    private static selections: string[] = [...Inventory3D.weapons, ...Inventory3D.powerups]

    public static currentSelection: string
    
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

    public static async aquirePickup(scene: Scene3D, obj: ExtendedObject3D): Promise<void>
    {
        
        if (obj.hasBody && Inventory3D.selections.includes(obj.name))
        {

            System.config.audio.play('macaroni_ring', 1, false, scene, 0);

            let player = scene['player'];

            if (Inventory3D.powerups.includes(obj.name))
                player.initPowerup(obj.name);
            
            if (Inventory3D.weapons.includes(obj.name))
            {
                const doesExist = await Inventory3D.checkDoesExist(obj); 
                
                if (doesExist)
                    Inventory3D.increment(scene, obj);
                else  
                {
    
                    System.config.audio.play('sick', 1, false, scene, 0);
                
                    scene.data['weapons'].push(obj.name);
    
                    player.currentEquipped.obj.remove(player.currentEquipped.obj.children[0]);
                    
                    Inventory3D.currentSelection = obj.name;
                    Inventory3D.setItem(scene, obj.name);
                    Inventory3D.increment(scene, obj);
                    
                }
            }
        
            if (System.config.events.socket !== null)
                System.config.events.socket.emit('DEATHMATCH: collected pickup', { key: obj.name, id: obj['_id'] });

            obj.remove(obj.children[0]);
            scene.third.physics.destroy(obj);

        }
    }

//------------------------------ set item

    public static async setItem(scene: Scene3D, item: string): Promise<void>
    {

        System.vibrate(20);
        
        let player = scene['player'];

        if (scene['player'].currentEquipped.obj !== null)
            scene['player'].currentEquipped.obj.remove(scene['player'].currentEquipped.obj.children[0]);

        const applySelection = async () => {

            switch (item)
            {
 
                case 'automac1000' : 
                    return [Inventory3D.ammo.automac1000, new Automac1000(player, scene)]; 
            }
        }

        let selection = await applySelection();
        
        if (selection)
        {
            scene['player'].currentEquipped.key = item;
            scene['player'].currentEquipped.quantity = selection[0];
            scene['player'].currentEquipped.obj = selection[1]; 
        }

        Inventory3D.currentSelection = item;

    }

//------------------------------- remove player's first person accessory

    public static setAsStandAloneItem (itemName: string, obj: ExtendedObject3D, child: ExtendedObject3D): void
    {
        switch(itemName)
        {
            case 'rolling_pin1': 
                Inventory3D.checkObjNames(child, 'arm', 'glove');
                obj.scale.set(3, 3, 3);
            break;
            case 'automac1000': 
                Inventory3D.checkObjNames(child, 'arm', 'glove', 'muzzle');
                obj.scale.set(5, 5, 5);
                obj['capacity'] = 30;
            break;
            case 'ikura_maki_tile':
                obj.scale.set(2, 2, 2);
            break;
        }
    }

//------------------------------- decrement

    public static decrement (scene: Scene3D, type: string, subject: string): void
    {
        Inventory3D[type][subject]--; 
        scene['player'].currentEquipped.quantity = Inventory3D[type][subject];
    }

//---------------------------------- increment

    private static async increment(scene: Scene3D, obj: ExtendedObject3D): Promise<void>
    {
        const getInventory = async () => {
            switch (obj.name)
            {
                case 'automac1000': 
                    return Inventory3D.ammo.automac1000 += obj['capacity']; 
            
            }
        },

        inventory = await getInventory();

        scene['player'].currentEquipped.quantity = inventory; 
    }

//------------------------------------------------- check names and set visibility to false

    private static checkObjNames(child: ExtendedObject3D, argA?: string, argB?: string, argC?: string): void
    {
        if (child.name === argA || (argB && child.name === argB) || (argC && child.name === argC))
            child.visible = false;
    }

    
//------------------------------------------------ check if item exists

    private static async checkDoesExist (obj: ExtendedObject3D): Promise<boolean>
    {
        if (Inventory3D.currentSelection === obj.name)
            return true;

        return false;
    }

}