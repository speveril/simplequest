import * as Cozy from 'Cozy';
import * as RPG from 'rpg';

import { bootSequence } from '../main';

export class GameOver extends RPG.Menu {
    closing:boolean = false;

    constructor() {
        super({
            className: 'menu gameover-menu',
            html: `
                <h1>Game Over</h1>
                <ul class="main selections">
                    <li data-menu="mainmenu">Back to Main Menu</li>
                </ul>
            `
        });

        this.setupSelections(this.find('.selections'));
    }

    mainmenu() {
        if (this.closing) return false;

        this.closing = true;
        RPG.Scene.do(function*() {
            yield* RPG.Scene.waitFadeTo("black", 1.0);
            RPG.Menu.pop();
            this.remove();
            bootSequence();
            yield 1;
        }.bind(this))
    }
}
