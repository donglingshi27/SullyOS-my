import React, { useEffect, useRef, useState } from 'react';
import { useOS } from '../context/OSContext';
import { INSTALLED_APPS, Icons } from '../constants';
import { Cloud, CloudRain, MagnifyingGlass, Moon, Sun, X } from '@phosphor-icons/react';
import { RealtimeContextManager, type WeatherData } from '../utils/realtimeContext';
import { isDevDebugAvailable } from '../utils/devDebug';
import { AppID } from '../types';

// Required Notice: Copyright (c) 2024-2026 NMJ (SullyOS / 手抓糯米机)
const IOS_DOCK = [AppID.GroupChat, AppID.Chat, AppID.Browser, AppID.Music];

const IOS_FOLDERS: { name: string; apps: AppID[] }[] = [
    { name: '社交网络', apps: [AppID.Social, AppID.CheckPhone, AppID.Call, AppID.Date] },
    { name: '校园学习', apps: [AppID.Study, AppID.Worldbook, AppID.Schedule, AppID.FAQ] },
    { name: '影音创作', apps: [AppID.Gallery, AppID.Songwriting, AppID.XhsStock, AppID.VoiceDesigner] },
    { name: 'AI 助手', apps: [AppID.Character, AppID.MemoryPalace, AppID.Guidebook] },
    { name: '生活娱乐', apps: [AppID.Room, AppID.LifeSim, AppID.Game, AppID.SpecialMoments] },
    { name: '办公文档', apps: [AppID.Journal, AppID.Novel, AppID.User, AppID.Handbook] },
    { name: '出行探索', apps: [AppID.VRWorld, AppID.XhsFreeRoam, AppID.HotNews] },
    { name: '生活工具', apps: [AppID.Appearance, AppID.ThemeMaker, AppID.Bank] },
];

const IOS_SECONDARY = [
    AppID.Character,
    AppID.Social,
    AppID.Gallery,
    AppID.Settings,
    AppID.Journal,
];

const IOS_APPS = [
    ...INSTALLED_APPS,
    { id: AppID.Browser, name: '浏览器', icon: 'Browser', color: 'blue' },
    { id: AppID.VoiceDesigner, name: '捏声音', icon: 'VoiceDesigner', color: 'rose' },
    { id: AppID.Handbook, name: '手账', icon: 'Handbook', color: 'amber' },
];

const IOS_ICONS = new Map(IOS_APPS.map(app => [app.id, app]));

const IOS_HOME_CSS = `
.ios-home{--icon:clamp(42px,15.8cqw,70px);--row:clamp(68px,24.7cqw,103px);--gutter:6.8%;position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;overflow:hidden;color:white;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif}
.ios-home *{box-sizing:border-box}
.ios-home button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ios-home button:focus-visible,.ios-home input:focus-visible{outline:2px solid #a5d1ff;outline-offset:3px}
.ios-home::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(15,18,26,.08),transparent 43%,rgba(20,24,30,.26))}
.ios-home-pages{position:absolute;inset:max(56px,calc(var(--safe-top,0px) + 11px)) 0 0;bottom:calc(var(--icon) + 9.4cqw + 32px);display:flex;overflow:auto hidden;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-inline:contain}
.ios-home-pages::-webkit-scrollbar,.ios-home-page::-webkit-scrollbar{display:none}
.ios-home-page{flex:0 0 100%;min-width:0;padding:0 var(--gutter) 28px;overflow-y:auto;scroll-snap-align:start;scroll-snap-stop:always;scrollbar-width:none}
.ios-widget-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6%;margin-bottom:clamp(13px,4.4cqw,23px)}
.ios-widget-wrap{min-width:0;text-align:center}
.ios-widget-wide{grid-column:1/-1}
.ios-widget{width:100%;border-radius:clamp(20px,6.8cqw,32px);overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.18);display:flex;position:relative}
.ios-widget-wide .ios-widget{aspect-ratio:2.13;flex-direction:column;justify-content:space-between;padding:4.7% 5.2%;text-align:left;background:linear-gradient(160deg,#343d4b,#202530 67%,#1a2430)}
.ios-widget-wrap:not(.ios-widget-wide) .ios-widget{aspect-ratio:1}
.ios-label{display:block;text-align:center;font-size:clamp(9px,2.75cqw,13px);line-height:1.3;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;text-shadow:0 1px 4px #172030b8;margin-top:4px;max-width:100%}
.ios-widget-wrap>.ios-label{margin-top:5px}
.ios-weather-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.ios-weather-city{font-size:clamp(12px,3.8cqw,20px);font-weight:600}
.ios-weather-temp{font-size:clamp(32px,10.6cqw,61px);letter-spacing:-.055em;line-height:1.04;font-weight:300}
.ios-weather-status{text-align:right;font-size:clamp(10px,3.05cqw,16px)}
.ios-weather-status svg{margin-left:auto}
.ios-weather-footer{display:flex;justify-content:space-between;border-top:1px solid #fff2;padding-top:4%;font-size:clamp(10px,3.15cqw,16px);color:#f3f5f9}
.ios-weather-footer span{color:#bac2ce}
.ios-clock{background:#fcfcfd;color:#101114;align-items:center;justify-content:center}
.ios-clock svg{position:absolute;inset:4%;width:92%;height:92%}
.ios-clock time{font-size:clamp(30px,9.9cqw,65px);font-stretch:condensed;font-weight:780;letter-spacing:-.09em;font-variant-numeric:tabular-nums;margin-right:.09em}
.ios-calendar{background:linear-gradient(145deg,#343537,#1e1f21);flex-direction:column;justify-content:space-between;text-align:left;padding:13% 12%}
.ios-calendar-day{font-size:clamp(32px,10.2cqw,65px);font-weight:300;line-height:1;letter-spacing:-.06em}
.ios-calendar-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;text-align:center;font-size:clamp(8px,2.35cqw,12px);font-variant-numeric:tabular-nums}
.ios-calendar-week b{background:#f04d55;border-radius:50%;font-weight:650}
.ios-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:var(--row);column-gap:2%;align-items:start;justify-items:center;margin:0 -3.2%}
.ios-app,.ios-folder{position:relative;display:flex;flex-direction:column;align-items:center;width:100%;min-width:0;background:none;border:0;padding:0}
.ios-app:active .ios-icon,.ios-folder:active .ios-folder-tile{scale:.92}
.ios-icon,.ios-folder-tile{width:var(--icon);height:var(--icon);border-radius:25%;position:relative;overflow:hidden;transition:scale .16s ease}
.ios-icon{display:grid;place-items:center;background:linear-gradient(155deg,var(--tile-hi),var(--tile));color:var(--ink,#fff);box-shadow:inset 0 0 0 .6px #ffffff85,inset 0 1.4px 0 #ffffff85,0 1.5px 3px #0004}
.ios-icon svg{width:68%;height:68%;filter:drop-shadow(0 1px 1px #0002)}
.ios-folder-tile{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:6%;padding:13%;background:linear-gradient(145deg,#ffffff62,#c6cad437);backdrop-filter:blur(13px) saturate(140%);-webkit-backdrop-filter:blur(13px) saturate(140%);box-shadow:inset 0 0 0 1px #ffffff78,inset 0 1px 5px #fff6,0 2px 4px #0002}
.ios-folder-tile .ios-icon{width:100%;height:100%;border-radius:25%}
.ios-badge{position:absolute;z-index:1;top:-5px;right:calc((100% - var(--icon))/2 - 5px);background:#ff3b30;min-width:19px;height:19px;padding:1px 4px;display:grid;place-items:center;border-radius:100px;font-size:11px;font-weight:600}
.ios-dock{position:absolute;left:3.4%;right:3.4%;bottom:clamp(8px,3.2cqw,18px);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));padding:clamp(10px,4.2cqw,22px) 2%;border-radius:clamp(25px,8.1cqw,45px);background:linear-gradient(155deg,#e0e0e033,#17191c55);backdrop-filter:blur(25px) saturate(150%);-webkit-backdrop-filter:blur(25px) saturate(150%);box-shadow:inset 0 0 0 1px #ffffff35,inset 0 1px 1px #ffffff24}
.ios-search{position:absolute;left:50%;translate:-50% 0;bottom:calc(var(--icon) + 9.4cqw + 22px);border:1px solid #fff3;border-radius:100px;background:#5b5d6385;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);display:flex;align-items:center;gap:5px;padding:5px 10px;font-size:clamp(9px,2.65cqw,13px)!important}
.ios-home-dialog{position:absolute;inset:0;z-index:2;display:grid;align-content:center;justify-items:center;background:#12161f54;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:var(--safe-top,0px) 7% 16px}
.ios-home-panel{width:100%;max-height:100%;overflow:auto;padding:16px 12px 10px;background:linear-gradient(135deg,#f9f9fd50,#b9bbca43);border:1px solid #ffffff62;border-radius:29px;box-shadow:0 16px 48px #14182444}
.ios-panel-head{display:flex;align-items:center;justify-content:space-between;margin:0 4px 15px}
.ios-panel-head h2{margin:0;font-size:21px;font-weight:650}
.ios-panel-head button{display:grid;place-items:center;border:0;border-radius:50%;background:#ffffff40;width:30px;height:30px}
.ios-home-panel .ios-grid{grid-template-columns:repeat(3,minmax(0,1fr));margin:0}
.ios-home-panel input{display:block;width:100%;margin-bottom:15px;border-radius:12px;padding:10px 12px;border:1px solid #fff5;background:#15182585;color:white;font-size:16px}
.ios-home-panel input::placeholder{color:#fff9}
.ios-page-turn{position:absolute;right:7%;bottom:calc(var(--icon) + 9.4cqw + 22px);font-size:12px!important;border:0;background:#2225;border-radius:100px;width:26px;height:26px}
.ios-home-missing{padding:10px 6px;margin:0;font-size:14px}
@media(prefers-reduced-motion:reduce){.ios-icon,.ios-folder-tile{transition:none}}
`;

const IOS_TILE_COLORS: Record<string, [string, string]> = {
    green: ['#48ef72','#0ab647'],
    emerald: ['#51eb78','#08b84a'],
    violet: ['#8279ff','#5148de'],
    indigo: ['#7483ff','#4052d2'],
    rose: ['#ff567e','#ed003d'],
    pink: ['#ff7b9d','#e72067'],
    red: ['#ff5d57','#f10f2d'],
    blue: ['#5fc5ff','#1775eb'],
    slate: ['#c3c6cb','#5e636d'],
    amber: ['#ffd85e','#ff9d16'],
    orange: ['#ffb252','#f37527'],
    lime: ['#beec68','#63af39'],
    cyan: ['#72deff','#00a4cc'],
    purple: ['#c18bff','#8441db'],
    fuchsia: ['#f97bf2','#b42dc5'],
};

function IOSIcon({ id }: { id: AppID }) {
    const app = IOS_ICONS.get(id);
    const Icon = Icons[app?.icon || 'Settings'] || Icons.Settings;
    const [highlight, base] =
        IOS_TILE_COLORS[app?.color || 'slate'] || IOS_TILE_COLORS.slate;

    const tile = {
        '--tile-hi': highlight,
        '--tile': base,
    } as React.CSSProperties;

    if (id === AppID.GroupChat) {
        Object.assign(tile, {
            '--tile-hi': '#ffef52',
            '--tile': '#ffce00',
            '--ink': '#3b2c22',
        });
    }

    if (id === AppID.Gallery) {
        Object.assign(tile, {
            '--tile-hi': '#fff',
            '--tile': '#d0d1d7',
            '--ink': '#4d4f57',
        });
    }

    if (id === AppID.Browser) {
        Object.assign(tile, {
            '--tile-hi': '#fff',
            '--tile': '#e7eaf0',
        });
    }

    return (
        <span className="ios-icon" style={tile} aria-hidden="true">
            {id === AppID.Browser ? (
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="49" fill="#168cf2"/>
                    {Array.from({ length: 36 }, (_, i) => (
                        <path
                            key={i}
                            d="M50 5v5"
                            stroke="white"
                            strokeWidth="1.35"
                            transform={`rotate(${i * 10} 50 50)`}
                        />
                    ))}
                    <path d="m77 23-18 36-18-18z" fill="#ff3b30"/>
                    <path d="m23 77 18-36 18 18z" fill="white"/>
                </svg>
            ) : id === AppID.Chat || id === AppID.GroupChat ? (
                <svg viewBox="0 0 64 64" fill="currentColor">
                    <path d="M32 8c-15 0-27 10-27 23 0 8 4 14 10 18l-3 9 11-6c3 1 6 1 9 1 15 0 27-10 27-22S47 8 32 8Z"/>
                    {id === AppID.GroupChat && (
                        <text
                            x="32"
                            y="36"
                            fill="#ffdf20"
                            textAnchor="middle"
                            fontSize="15"
                            fontWeight="800"
                        >
                            TALK
                        </text>
                    )}
                </svg>
            ) : (
                <Icon />
            )}
        </span>
    );
}

function IOSClockWidget({
    hours,
    minutes,
}: {
    hours: number;
    minutes: number;
}) {
    const clock = [hours, minutes]
        .map(number => String(number).padStart(2, '0'))
        .join(':');

    return (
        <div className="ios-widget-wrap">
            <div className="ios-widget ios-clock">
                <svg viewBox="0 0 160 160" aria-hidden="true">
                    {Array.from({ length: 60 }, (_, i) => (
                        <line
                            key={i}
                            x1="80"
                            x2="80"
                            y1="3"
                            y2={i % 5 === 0 ? 10 : 8}
                            stroke="#19191d"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            opacity={0.25 + (i / 60) * 0.7}
                            transform={`rotate(${i * 6} 80 80)`}
                        />
                    ))}
                </svg>
                <time>{clock}</time>
            </div>
            <span className="ios-label">时钟</span>
        </div>
    );
}

function IOSCalendarWidget() {
    const now = new Date();

    const days = Array.from(
        { length: 7 },
        (_, i) =>
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - ((now.getDay() + 6) % 7) + i,
            ),
    );

    return (
        <div className="ios-widget-wrap">
            <div className="ios-widget ios-calendar">
                <span>{now.getMonth() + 1}月</span>
                <span className="ios-calendar-day">{now.getDate()}</span>

                <div className="ios-calendar-week">
                    {days.map(day =>
                        day.getDate() === now.getDate() ? (
                            <b key={day.toISOString()}>{day.getDate()}</b>
                        ) : (
                            <span key={day.toISOString()}>{day.getDate()}</span>
                        ),
                    )}
                </div>
            </div>

            <span className="ios-label">日历</span>
        </div>
    );
}

function IOSHome() {
    const {
        openApp,
        unreadMessages,
        virtualTime,
        realtimeConfig,
        theme,
    } = useOS();

    const [folder, setFolder] =
        useState<(typeof IOS_FOLDERS)[number] | null>(null);

    const [search, setSearch] = useState(false);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    const pageRef = useRef<HTMLDivElement>(null);
    const dockRef = useRef<HTMLElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    const dialogOpen = search || folder !== null;

    const unread = Object.values(unreadMessages).reduce(
        (sum, count) => sum + count,
        0,
    );

    const weatherEnabled =
        realtimeConfig.weatherEnabled &&
        Boolean(realtimeConfig.weatherApiKey);

    useEffect(() => {
        if (!weatherEnabled) return;

        let active = true;

        const refresh = () =>
            void RealtimeContextManager.fetchWeather(realtimeConfig).then(
                data => {
                    if (active) setWeather(data);
                },
            );

        refresh();

        const timer = window.setInterval(refresh, 10 * 60 * 1000);

        return () => {
            active = false;
            window.clearInterval(timer);
        };
    }, [realtimeConfig, weatherEnabled]);

    useEffect(() => {
        if (folder) closeRef.current?.focus();
    }, [folder]);

    useEffect(() => {
        pageRef.current?.toggleAttribute('inert', dialogOpen);
        dockRef.current?.toggleAttribute('inert', dialogOpen);
    }, [dialogOpen]);

    const dismiss = () => {
        setFolder(null);
        setSearch(false);
        setQuery('');
    };

    const appButton = (id: AppID, dock = false) => {
        const app = IOS_ICONS.get(id);
        if (!app) return null;

        return (
            <button
                key={id}
                className="ios-app"
                aria-label={app.name}
                onClick={() => {
                    dismiss();
                    openApp(id);
                }}
            >
                <IOSIcon id={id}/>

                {!dock && <span className="ios-label">{app.name}</span>}

                {id === AppID.Chat && unread > 0 && (
                    <span className="ios-badge">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>
        );
    };

    const visibleWeather = weatherEnabled ? weather : null;

    const WeatherIcon = visibleWeather?.icon.startsWith('01')
        ? visibleWeather.icon.endsWith('n')
            ? Moon
            : Sun
        : /^(09|10|11)/.test(visibleWeather?.icon || '')
          ? CloudRain
          : Cloud;

    const results = IOS_APPS
        .filter(
            app =>
                app.id !== AppID.CharCreatorDev ||
                isDevDebugAvailable(),
        )
        .filter(app =>
            `${app.name} ${app.id}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
        );

    const defaultWallpaper = /#FFDEE9\b/i.test(theme.wallpaper);

    return (
        <main
            className="ios-home"
            style={
                defaultWallpaper
                    ? {
                          background:
                              'linear-gradient(148deg,#859099,#535d65 52%,#353e46)',
                      }
                    : undefined
            }
        >
            <style>{IOS_HOME_CSS}</style>

            <div
                className="ios-home-pages"
                ref={pageRef}
                aria-hidden={dialogOpen || undefined}
                onScroll={event =>
                    setPage(
                        Math.round(
                            event.currentTarget.scrollLeft /
                                (event.currentTarget.clientWidth || 1),
                        ),
                    )
                }
            >
                <section
                    className="ios-home-page"
                    aria-label="主屏幕第一页"
                >
                    <div className="ios-widget-row">
                        <div className="ios-widget-wrap ios-widget-wide">
                            <button
                                className="ios-widget"
                                onClick={() => openApp(AppID.Settings)}
                                aria-label="天气设置"
                            >
                                <div className="ios-weather-top">
                                    <div>
                                        <div className="ios-weather-city">
                                            {visibleWeather?.city ||
                                                realtimeConfig.weatherCity ||
                                                '天气'}
                                        </div>

                                        <div className="ios-weather-temp">
                                            {visibleWeather
                                                ? `${visibleWeather.temp}°`
                                                : '—°'}
                                        </div>
                                    </div>

                                    <div className="ios-weather-status">
                                        <WeatherIcon
                                            size={27}
                                            weight="fill"
                                        />

                                        <span>
                                            {visibleWeather?.description ||
                                                (weatherEnabled
                                                    ? '暂无天气数据'
                                                    : '点此配置天气')}
                                        </span>
                                    </div>
                                </div>

                                <div className="ios-weather-footer">
                                    <span>
                                        体感{' '}
                                        <strong>
                                            {visibleWeather
                                                ? `${visibleWeather.feelsLike}°`
                                                : '—'}
                                        </strong>
                                    </span>

                                    <span>
                                        湿度{' '}
                                        <strong>
                                            {visibleWeather
                                                ? `${visibleWeather.humidity}%`
                                                : '—'}
                                        </strong>
                                    </span>
                                </div>
                            </button>

                            <span className="ios-label">天气</span>
                        </div>
                    </div>

                    <div className="ios-grid">
                        {IOS_FOLDERS.map(group => (
                            <button
                                key={group.name}
                                className="ios-folder"
                                onClick={() => setFolder(group)}
                            >
                                <span className="ios-folder-tile">
                                    {group.apps.map(id => (
                                        <IOSIcon key={id} id={id}/>
                                    ))}
                                </span>

                                <span className="ios-label">
                                    {group.name}
                                </span>
                            </button>
                        ))}

                        {[
                            AppID.Character,
                            AppID.Call,
                            AppID.Gallery,
                            AppID.Settings,
                            AppID.Appearance,
                            AppID.Study,
                        ].map(id => appButton(id))}
                    </div>
                </section>

                <section
                    className="ios-home-page"
                    aria-label="主屏幕第二页"
                >
                    <div className="ios-widget-row">
                        <IOSCalendarWidget/>
                        <IOSClockWidget {...virtualTime}/>
                    </div>

                    <div className="ios-grid">
                        {IOS_SECONDARY.map(id => appButton(id))}

                        {Array.from({ length: 7 }, (_, i) => (
                            <span key={i} aria-hidden="true"/>
                        ))}

                        {[
                            AppID.Browser,
                            AppID.Worldbook,
                            AppID.ThemeMaker,
                            AppID.Appearance,
                        ].map(id => appButton(id))}
                    </div>
                </section>
            </div>

            <button
                className="ios-search"
                onClick={() => setSearch(true)}
                tabIndex={dialogOpen ? -1 : 0}
            >
                <MagnifyingGlass size={13} weight="bold"/>
                搜索
            </button>

            <button
                className="ios-page-turn"
                aria-label={page ? '上一页' : '下一页'}
                tabIndex={dialogOpen ? -1 : 0}
                onClick={() =>
                    pageRef.current?.scrollTo({
                        left: page
                            ? 0
                            : pageRef.current.clientWidth,
                        behavior: 'smooth',
                    })
                }
            >
                {page ? '‹' : '›'}
            </button>

            <nav
                className="ios-dock"
                ref={dockRef}
                aria-label="Dock"
                aria-hidden={dialogOpen || undefined}
            >
                {IOS_DOCK.map(id => appButton(id, true))}
            </nav>

            {dialogOpen && (
                <div
                    className="ios-home-dialog"
                    onClick={dismiss}
                    onKeyDown={event => {
                        if (event.key === 'Escape') dismiss();
                    }}
                >
                    <section
                        className="ios-home-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label={folder?.name || '搜索应用'}
                        onClick={event => event.stopPropagation()}
                    >
                        <header className="ios-panel-head">
                            <h2>{folder?.name || '搜索应用'}</h2>

                            <button
                                ref={closeRef}
                                aria-label="关闭"
                                onClick={dismiss}
                            >
                                <X size={16} weight="bold"/>
                            </button>
                        </header>

                        {search && (
                            <input
                                autoFocus
                                value={query}
                                onChange={event =>
                                    setQuery(event.target.value)
                                }
                                aria-label="应用名称"
                                placeholder="搜索应用"
                            />
                        )}

                        <div className="ios-grid">
                            {(folder
                                ? folder.apps
                                : results.map(app => app.id)
                            ).map(id => appButton(id))}
                        </div>

                        {search && results.length === 0 && (
                            <p className="ios-home-missing">
                                没有找到应用
                            </p>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}

export default function HomeLauncher() {
    return <IOSHome/>;
}