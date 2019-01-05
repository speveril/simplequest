import * as Cozy from 'Cozy';

export class SavedGameComponent extends Cozy.UiComponent {
    constructor(args:any) {
        super({
            tag: 'li',
            className: 'saved-game',
            html: `
                <div class="image">
                    <img src="">
                </div>
                <div class="info">
                    <div class="game-name">${args.name}</div>
                    <div class="game-time">${args.time}</div>
                    <div class="confirmation">Save over this slot?</div>
                    <div class="confirmation-new">Save new game?</div>
                </div>
            `
        });
        
        // For whatever reason, just outputting the <img> tag with the proper src
        // doesn't work consistently (on Macs); might be some sort of limitation
        // on the length of a src URL? Anyway, setting the attribute directly
        // seems to work.
        this.find('.image img').setAttribute('src', args.img);
        this.element.setAttribute('data-id', args.id);
        this.element.setAttribute('data-menu', 'choose');
    }
}
