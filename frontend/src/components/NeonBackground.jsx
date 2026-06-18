import './NeonBackground.css';

export function NeonBackground() {
    return (
        <div id="neon" aria-hidden="true">
            <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
                <g className="drift-a">
                    <path className="nl" d="M-120,616 C 360,392 720,836 1020,594 C 1320,352 1620,414 2040,536"/>
                    <path className="nl" d="M-120,640 C 360,420 720,860 1020,620 C 1320,380 1620,440 2040,560"/>
                    <path className="nl" d="M-120,664 C 360,448 720,884 1020,646 C 1320,404 1620,466 2040,584"/>
                    <path className="np" d="M-120,640 C 360,420 720,860 1020,620 C 1320,380 1620,440 2040,560" style={{ animationDelay: '-1s' }}/>
                </g>
                <g className="drift-b">
                    <path className="nl" d="M-120,496 C 360,716 720,276 1020,536 C 1320,796 1620,676 2040,576"/>
                    <path className="nl" d="M-120,520 C 360,740 720,300 1020,560 C 1320,820 1620,700 2040,600"/>
                    <path className="nl" d="M-120,544 C 360,764 720,324 1020,584 C 1320,844 1620,724 2040,624"/>
                    <path className="np" d="M-120,520 C 360,740 720,300 1020,560 C 1320,820 1620,700 2040,600" style={{ animationDelay: '-5s' }}/>
                </g>
            </svg>
        </div>
    );
}
