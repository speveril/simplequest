import * as Cozy from 'Cozy';
import * as RPG from 'rpg';

export class ItemComponent extends Cozy.UiComponent {
    constructor(args:any) {
        super({
            tag: 'li',
            className: 'item',
            html: `
                ${args.icon}
                <span class="name">${args.name}</span>
                <span class="count">${args.count}</span>
                <span class="price">${args.price}${RPG.getMoneyName()}</span>
            `
        });

        if (!args.count) this.find('.count').remove();
        if (!args.price) this.find('.price').remove();
    }

    setPrice(n:number):void {
        this.find('.price').innerText = n.toString() + RPG.getMoneyName();
    }

    setCount(n:number):void {
        this.find('.count').innerText = n.toString();
    }
}
