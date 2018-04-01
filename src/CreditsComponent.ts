module SimpleQuest {
    export class CreditsComponent extends Cozy.UiComponent {
        public scrolled:number;
        private scroller:HTMLElement;
        private holdIndicator:HTMLElement;

        constructor() {
            super({
                className: 'credits',
                html: `
<meter class="hold-indicator"></meter>
<div class="scroller">
    <div>
        <h1>Simple Quest</h1>

        <p class="centered">
            built with Cozy Engine<br>
            https://cozyengine.com/
        </p>

        <h2>Programming<br>Writing</h2>

        <ul>
            <li>Shamus Peveril</li>
        </ul>


        <h2>Art</h2>

        <ul>
            <li>Grimfist</li>
            <li>Hyptosis</li>
            <li>Jerom</li>
            <li>Lanea Zimmerman</li>
            <li>PriorBlue</li>
            <li>Shamus Peveril</li>
            <li>William Thompson</li>
        </ul>


        <h2>Music</h2>

        <ul>
            <li>800 M.P.H.</li>
            <li>Jasprelao</li>
            <li>Jeremiah George</li>
            <li>Joseph Gilbert</li>
            <li>Otto Halmén</li>
            <li>remaxim</li>
            <li>Snowy Fox</li>
            <li>Subaru</li>
            <li>Tarranon</li>
        </ul>


        <h2>Sound Effects</h2>

        <ul>
            <li>David McKee (ViRiX)</li>
            <li>Juhani Junkala</li>
            <li>Michael Koenig</li>
            <li>Shamus Peveril</li>
            <li>Sound Effect Lab</li>
        </ul>

        <h2>Early Feedback</h2>

        <ul>
            <li>Eliot</li>
            <li>Kyle</li>
            <li>Sarah</li>
            <li>Tim</li>
        </ul>

        <h2></h2>

        <p class="centered">
            More complete details (including license information) available in README.txt
        </p>


        <h2>Special Thanks</h2>

        <ul>
            <li>tulokyn</li>
            <li>Hyptosis</li>
            <li>Eliot</li>
            <li>Liam</li>
            <li>DawnBringer</li>
            <li>#just_stars_now</li>
            <li>#sancho</li>
            <li>#killpop</li>
            <li>opengameart.org</li>
            <li>rpgmaker.net</li>
            <li>verge-rpg.com</li>
            <li>codepen.io</li>
        </ul>
    </div>
</div>
                `
            });

            this.scrolled = -this.element.clientHeight;
            this.scroller = this.find('.scroller');
            this.holdIndicator = this.find('.hold-indicator');
        }

        getScrollLength() {
            return this.scroller.scrollHeight - this.scroller.clientHeight;
        }

        scroll(dy) {
            this.scrolled += dy;
            this.scroller.scrollTop = this.scrolled | 0;
        }


        setHoldLevel(x:number) {
            this.holdIndicator.setAttribute('value', x.toString());
            if (x > 0) {
                this.holdIndicator.classList.add('visible');
            } else {
                this.holdIndicator.classList.remove('visible');
            }
        }
    }
}
