import './style.css';

import { enable3d } from '@enable3d/phaser-extension';   
import Application from './scripts/internals/Application';

'use strict';



//-------------------- window error

    // window.onerror = function(err, url, line){
    //     alert(`${err}, \n ${url}, \n ${line}`);
      //window.location.reload();
    //     return true;
    // }

//--------------------- on load

    window.onload = async ()=> {          

        System.Process.app = new Application(System.Process); 
        enable3d(() => System.Process.game = new Phaser.Game(System.Process.app))
        //.withPhysics('https://rossmarinaro.github.io/fps/wasm')
        .withPhysics('assets/wasm');

    }  


//-------------------- off load

    window.onbeforeunload = ()=> {


    } 


    