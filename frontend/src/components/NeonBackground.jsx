import './NeonBackground.css';

export function NeonBackground({ variant = 'green' }) {
    return (
        <div id="neon" className={variant !== 'green' ? `neon-${variant}` : ''} aria-hidden="true">
            <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
                {/* Группа A — плавная волна через середину */}
                <g className="drift-a">
                    <path className="nl" d="M-120,616 C 360,392 720,836 1020,594 C 1320,352 1620,414 2040,536"/>
                    <path className="nl" d="M-120,640 C 360,420 720,860 1020,620 C 1320,380 1620,440 2040,560"/>
                    <path className="nl" d="M-120,664 C 360,448 720,884 1020,646 C 1320,404 1620,466 2040,584"/>
                    <path className="np" d="M-120,640 C 360,420 720,860 1020,620 C 1320,380 1620,440 2040,560" style={{ animationDelay: '-1s' }}/>
                </g>

                {/* Группа B — встречная волна */}
                <g className="drift-b">
                    <path className="nl" d="M-120,496 C 360,716 720,276 1020,536 C 1320,796 1620,676 2040,576"/>
                    <path className="nl" d="M-120,520 C 360,740 720,300 1020,560 C 1320,820 1620,700 2040,600"/>
                    <path className="nl" d="M-120,544 C 360,764 720,324 1020,584 C 1320,844 1620,724 2040,624"/>
                    <path className="np" d="M-120,520 C 360,740 720,300 1020,560 C 1320,820 1620,700 2040,600" style={{ animationDelay: '-5s' }}/>
                </g>

                {/* Группа C — верхняя зона */}
                <g className="drift-c">
                    <path className="nl" d="M-120,180 C 300,80  660,320 960,160 C 1260,-20 1580,120 2040,80"/>
                    <path className="nl" d="M-120,204 C 300,104 660,344 960,184 C 1260,4   1580,144 2040,104"/>
                    <path className="nl nl--faint" d="M-120,228 C 300,128 660,368 960,208 C 1260,28  1580,168 2040,128"/>
                    <path className="np np--fast" d="M-120,204 C 300,104 660,344 960,184 C 1260,4 1580,144 2040,104" style={{ animationDelay: '-3s' }}/>
                </g>

                {/* Группа D — нижняя зона */}
                <g className="drift-d">
                    <path className="nl" d="M-120,900 C 320,1020 700,780 1000,940 C 1300,1100 1640,920 2040,980"/>
                    <path className="nl" d="M-120,924 C 320,1044 700,804 1000,964 C 1300,1124 1640,944 2040,1004"/>
                    <path className="nl nl--faint" d="M-120,948 C 320,1068 700,828 1000,988 C 1300,1148 1640,968 2040,1028"/>
                    <path className="np" d="M-120,924 C 320,1044 700,804 1000,964 C 1300,1124 1640,944 2040,1004" style={{ animationDelay: '-7s' }}/>
                </g>

                {/* Группа E — диагональ слева-направо, тонкая */}
                <g className="drift-e">
                    <path className="nl nl--faint" d="M-120,320 C 240,160 560,560 900,380 C 1200,200 1560,460 2040,300"/>
                    <path className="nl nl--faint" d="M-120,344 C 240,184 560,584 900,404 C 1200,224 1560,484 2040,324"/>
                    <path className="np np--slow" d="M-120,332 C 240,172 560,572 900,392 C 1200,212 1560,472 2040,312" style={{ animationDelay: '-11s' }}/>
                </g>

                {/* Группа F — правая диагональ снизу-вверх */}
                <g className="drift-f">
                    <path className="nl nl--faint" d="M-120,760 C 300,900 680,600 1040,780 C 1360,940 1700,700 2040,820"/>
                    <path className="nl nl--faint" d="M-120,784 C 300,924 680,624 1040,804 C 1360,964 1700,724 2040,844"/>
                    <path className="np np--fast" d="M-120,772 C 300,912 680,612 1040,792 C 1360,952 1700,712 2040,832" style={{ animationDelay: '-4s' }}/>
                </g>
            </svg>
        </div>
    );
}