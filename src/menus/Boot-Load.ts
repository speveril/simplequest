import * as Cozy from 'Cozy';
import * as RPG from 'rpg';
import { SavedGameComponent } from './SavedGameComponent';

export class Boot_Load extends RPG.Menu {
    private savedGames:RPG.SavedGame[];
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

        RPG.SavedGame.getList()
            .then((games) => {
                this.savedGames = games;
                for (let game of games) {
                    let fstat = game.file.stat();
                    this.addChild(new SavedGameComponent({
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

    choose() {
        this.choice = this.savedGames[this.selectionIndex];
        console.log("CHOOSE>", this.choice);
        RPG.Menu.pop();
    }
}
