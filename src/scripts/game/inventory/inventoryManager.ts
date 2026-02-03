import * as types from '../../../../typings/types'
import * as ENABLE3D from '@enable3d/phaser-extension'

import { System } from '../../internals/Config'
import { PlayerItem } from './playerItem'
import { Actor } from '../Actor'
import { AudioManager } from '../../internals/Audio'
import { EventManager } from '../../internals/Events'

export class Inventory3D {

    public static currentInventory: string[] = [ 'rolling_pin1' ]
    public static currentSelection: string = ''

    private static weapons: string[] = [ 
        'rolling_pin1', 
        'penne_pistol', 
        'automac1000', 
        'rigatoni_rocket_launcher' 
    
    ]

    private static powerups: string[] = [ 
        'ikura_maki_tile', 
        'beer_tile', 
        'coffee' 
    ]

    private static selections: string[] = [...this.weapons, ...this.powerups]
    
    public static ammo: types.ammo = {

        automac1000: 0,
        penne_pistol: 0,
        rigatoni_rocket_launcher: 0,
        grenade: 0,
        dynamite: 0 
    }


//------------------------------------------- item defaults

    
    private static async getDefaultItemValue(key: string): Promise<number>
    {
        return new Promise(res => {

            switch (key)
            {
                case 'automac1000': return res(30);
                case 'penne_pistol': return res(10);
                case 'rigatoni_rocket_launcher': return res(5);
                case 'grenade': 
                case 'dynamite': return res(1);
                case 'rolling_pin1' : default: return res(-1);
            }
        });
    }

    
//------------------------------------------------ reset inventory to defaults


    public static async reset(base?: number): Promise<void>
    {
        this.currentSelection = '';
        this.currentInventory.length = 0;
        this.currentInventory.push('rolling_pin1');
        
        this.ammo = {
            automac1000: base ? base : await this.getDefaultItemValue('automac1000'),
            penne_pistol: base ? base : await this.getDefaultItemValue('penne_pistol'),
            rigatoni_rocket_launcher: base ? base : await this.getDefaultItemValue('rigatoni_rocket_launcher'),
            grenade: base ? base : await this.getDefaultItemValue('grenade'),
            dynamite: base ? base : await this.getDefaultItemValue('dynamite')
        }
    }


//------------------------------------------------ ammo


    public static makeUnlimitedAmmo (): void
    {
        this.ammo = {
            automac1000: Infinity,
            penne_pistol: Infinity,
            rigatoni_rocket_launcher: Infinity,
            grenade: Infinity,
            dynamite: Infinity
        }
    }


//------------------------------------------------ get item / pickup

    
    public static async aquirePickup (scene: ENABLE3D.Scene3D, obj: ENABLE3D.ExtendedObject3D): Promise<void>
    {
        const key = obj['key'];

        if (obj.hasBody && this.selections.includes(key))
        {
            const utils = (await import ('../../internals/Utils')).default,
                  str = await utils.strings.removeJunk(key),
                  article = await utils.strings.checkVowel(str),
                  player = scene['player'];

            //cancel if player is dead

            if (!player.alive)
                return;

            AudioManager.play('ring', 1, false, scene, 0);

            if (scene.scene.manager.getScene('Alerts') && typeof scene.scene.get('Alerts')['alert'] === 'function')
                scene.scene.get('Alerts')['alert']('small', `You picked up ${article} ${str}`);
    
            if (this.powerups.includes(key)) 
                player.initPowerup(key);
            
            if (this.weapons.includes(key))
            {
                const doesExist = await this.checkDoesExist(obj); 
                
                if (doesExist)
                    this.increment(scene, obj);

                else  
                {
                    if (player.currentEquipped.obj)
                        player.currentEquipped.obj.remove(player.currentEquipped.obj.children[0]);

                    this.ammo[key] = await this.getDefaultItemValue(key);

                    await this.setItem(scene, key);

                    if (scene.data['weapons'])
                        scene.data['weapons'].push(key);    
                }
            }

            obj.remove(obj.children[0]); //@ts-ignore
            scene['third'].physics.destroy(obj);
        }
    }


//------------------------------ set item


    public static async setItem(scene: ENABLE3D.Scene3D, key: string): Promise<void>
    {
        return new Promise(async res => {

            System.Config.vibrate(20);

            if (this.currentSelection === key)
                return;
        
            const player = scene['player'],

            willFlipY = async (): Promise<boolean> => {

                switch (key)
                {
                    case 'rolling_pin1' : 
                    case 'rolling_pin2' :
                    case 'rolling_pin3' :
                    default:
                        return false;

                    case 'penne_pistol' :
                    case 'automac1000' : 
                    case 'rigatoni_rocket_launcher' : 
                        return true;
                }
            },

            flipY = await willFlipY();
            
            if (player.currentEquipped.obj !== null)
                player.currentEquipped.obj.remove(player.currentEquipped.obj.children[0]);
                
            player.currentEquipped.key = key;
            
            player.currentEquipped.obj = null;
            player.currentEquipped.obj = new PlayerItem(scene, key, flipY); 

            player.currentEquipped.quantity = (scene.data['weapons'] instanceof Array && !scene.data['weapons'].includes(key)) ? 
                await this.getDefaultItemValue(key) : this.ammo[key];

            player.swapItem(key);

            this.currentSelection = key;

            res();

        });
    }



//-------------------------------- check next best item


    public static checkNextBestItem(scene: ENABLE3D.Scene3D): void
    {
        this.currentInventory.forEach(async () => {

            let item = 'rolling_pin1';

            for (let entry of Object.entries(this.ammo))

                if (this.currentInventory.includes(entry[0]) && entry[1] > 0) 
                    item = entry[0];

            this.setItem(scene, item);
                
        });
    }


//------------------------------- remove player's first person accessory


    public static setAsStandAloneItem (target: ENABLE3D.ExtendedObject3D, child: ENABLE3D.ExtendedObject3D): void
    {
        switch(target['key'])
        {
            case 'rolling_pin1': 
                this.checkObjNames(child, 'arm', 'glove');
                target.scale.set(3, 3, 3);
            break;

            case 'penne_pistol': 
                this.checkObjNames(child, 'arm', 'glove', 'muzzle');
                target.scale.set(6.1, 6.1, 6.1);
            break;

            case 'automac1000': 
                this.checkObjNames(child, 'arm', 'glove', 'muzzle');
                target.scale.set(5, 5, 5);
            break;

            case 'rigatoni_rocket_launcher': 
                target.scale.set(7, 7, 7);
            break;

            case 'ikura_maki_tile': 
                target.scale.set(2, 2, 2);
            break;
            
            case 'beer_tile': 
            case 'coffee':
                target.scale.set(3, 3, 3);
            break;
        }
    }


    //--------------------------------- set third person weapon


    public static setItemForThirdPerson (target: Actor, child: ENABLE3D.ExtendedObject3D): void
    {
        switch(target['key'])
        {
            case 'rolling_pin1': 
                target.scale.set(3, 3, 3);
                this.checkObjNames(child, 'arm', 'glove'); 
            break;
            case 'penne_pistol': 
            case 'automac1000':console.log(target['key'])
                target.scale.set(5, 5, 5);
                this.checkObjNames(child, 'arm', 'glove', 'muzzle'); 
            break;
            case 'rigatoni_rocket_launcher':
                target.scale.set(6.1, 6.1, 6.1);
            break;
        }
    }


//-------------------------------- cycle


    public static cycleInventory(scene: ENABLE3D.Scene3D, direction: number): void
    {
        let index = this.currentInventory.indexOf(this.currentSelection),
            end = this.currentInventory.length - 1;
                    
        if (direction >= 1) 
        {
            if (index < end)  
                index++;
            else  
                index = 0;
        }
        
        if (direction <= -1)
        {
            if (index > 0)
                index--;
            else
                index = end;
        }
            
        const selection = this.currentInventory[index];
        
        if (selection)
            this.setItem(scene, selection); 
    }


//------------------------------- decrement


    public static decrement (scene: ENABLE3D.Scene3D, subject: string): void
    {
        if (!this.ammo[subject] || this.ammo[subject] === -1) //weapon doesn't use ammo
            return;

        this.ammo[subject]--; 
        scene['player'].currentEquipped.quantity = this.ammo[subject];
    }


//---------------------------------- increment


    private static async increment(scene: ENABLE3D.Scene3D, obj: ENABLE3D.ExtendedObject3D): Promise<void>
    {

        const key = obj['key'], 
            currentEquipped = scene['player'].currentEquipped,
            value = await this.getDefaultItemValue(key);

        this.ammo[key] += value;

        currentEquipped.quantity = this.ammo[currentEquipped.key];

    }


//------------------------------------------------- check names and set visibility to false



    private static checkObjNames(child: ENABLE3D.ExtendedObject3D, argA?: string, argB?: string, argC?: string): void
    {

        if (argA && child.name.includes(argA) || 
           (argB && child.name.includes(argB)) || 
           (argC && child.name.includes(argC)))

        child.visible = false;
    }

    
//------------------------------------------------ check if item exists



    private static async checkDoesExist (obj: ENABLE3D.ExtendedObject3D): Promise<boolean>
    {

        if (this.currentInventory.includes(obj['key']))
            return true;
        
        this.currentInventory.push(obj['key']);
        
        return false;
    }

}