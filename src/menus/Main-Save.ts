import * as Cozy from 'Cozy';
import * as RPG from 'rpg';

import { SavedGameComponent } from './SavedGameComponent';

export class Main_SaveSubmenu extends RPG.Menu {
    constructor() {
        super({
            cancelable: true,
            className: 'panel save',
            tag: 'div',
            html: `
                <div class="title">Save Game</div>
                <ul class="selections scrollable"></ul>
            `
        });

        this.addChild(new SavedGameComponent({
            id: '@new',
            img: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // transparent 1 pixel gif
            name: 'New Saved Game',
            time: '-'
        }), 'ul.selections');

        RPG.SavedGame.getList()
            .then((games) => {
                for (let game of games) {
                    let fstat = game.file.stat();
                    this.addChild(new SavedGameComponent({
                        id: game.file.name,
                        img: game.data.image,
                        name: game.data.name,
                        time: fstat.mtime.toLocaleString('en-GB')
                    }), 'ul.selections');
                }
                this.setupSelections(this.find('ul.selections'));
            });
    }

    stop() {
        super.stop();
        this.remove();
    }

    choose(e) {
        const confirmation = this.find('.confirm');
        if (confirmation) {
            RPG.SavedGame.fromState()
                .then((saveGame) => {
                    const filename = e.getAttribute('data-id');
                    if (filename !== '@new') saveGame.file = new Cozy.UserdataFile(filename);
                    saveGame.writeToDisk();
                    // TODO tell the player it worked
                    RPG.Menu.pop();
                });
        } else {
            e.classList.add('confirm');
        }
    }

    cancel() {
        const confirmation = this.find('.confirm');
        if (!confirmation) return super.cancel();
        confirmation.classList.remove('confirm');
    }

    setSelection(index) {
        const confirmation = this.find('.confirm');
        if (!confirmation) return super.setSelection(index);
        return false;
    }
}
