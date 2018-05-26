import * as Cozy from 'Cozy';
import * as RPG from 'Lotus';

export * from './Boot';
export * from './GameOver';
export * from './Main';
export * from './Shop';

export function quitGame() {
    RPG.Scene.do(function*() {
        yield* RPG.Scene.waitFadeTo("black", 1.0);
        Cozy.quit();
    }.bind(this));
}
