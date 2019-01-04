import * as Cozy from 'Cozy';
import * as RPG from 'rpg';
import { GameMap } from '../src/Map';

export class Map_Overworld extends GameMap {
    public static mapFile:string = 'map/overworld.tmx';
    public static musicName:string = 'overworld';

    public static preload() {
        return Promise.all([
            GameMap.preload.call(Map_Overworld),
            Cozy.gameDir().file('map/tileset.tsx').load(), // all the maps use the same tileset; make sure it gets preloaded here
        ]);
    }

    start() {
        RPG.getPlayer().speed *= 0.6;
    }

    finish() {
        RPG.getPlayer().speed /= 0.6;
    }

    enter_town(args) {
        RPG.startMap('village', 8, 1);
    }

    enter_forest(args) {
        if (args.tx == 13 && args.ty == 7) {
            RPG.startMap('forest', 7, 43);
        } else {
            RPG.startMap('forest', 32, 1);
        }
    }

    enter_castle(args) {
        RPG.startMap('castle', 19.5, 43);
    }

    enter_cave(args) {
        RPG.startMap('cave', 9, 43);
    }

    examine_ship(args) {
        RPG.Scene.do(function*() {
            yield* RPG.Scene.waitTextbox('Hero', ["I can't leave yet."]);
        }.bind(this));
    }
}
