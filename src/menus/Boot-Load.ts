import * as Cozy from 'Cozy';
import * as RPG from 'rpg';
import { SavedGameComponent } from './SavedGameComponent';

export class Boot_Load extends RPG.Menu {
    choice:RPG.SavedGame;

    constructor() {
        super({
            cancelable: true,
            className: 'boot-load-menu box',
            tag: 'div',
            html: `
                <div class="title">Load Game</div>
                <ul class="selections scrollable"></ul>
            `
        });

        this.choice = null;

        const savedGames = RPG.SavedGame.getList();
        const promises = [];

        for (let game of savedGames) {
            promises.push(
                new Promise((resolve, reject) => {
                    return game.file.stat();
                })
                .then((fstat:any) => { // TODO clean up :any
                    this.addChild(new SavedGameComponent({
                        id: game.file.path,
                        img: game.data.image,
                        name: game.data.name,
                        time: fstat.mtime.toLocaleString('en-GB')
                    }), 'ul.selections');
                })
            );
        }

        Promise.all(promises).then(() => this.setupSelections(this.find('ul.selections')));
    }

    stop() {
        super.stop();
        this.remove();
    }

    choose() {
        this.choice = RPG.SavedGame.getList()[this.selectionIndex];
        RPG.Menu.pop();
    }
}
