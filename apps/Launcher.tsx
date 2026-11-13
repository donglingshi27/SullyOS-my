import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOS } from '../context/OSContext';
import { INSTALLED_APPS, DOCK_APPS } from '../constants';
import AppIcon from '../components/os/AppIcon';
import { DB } from '../utils/db';
import { AppID, CharacterProfile, DailySchedule } from '../types';
import {
  ScheduleHomeWidget,
  ScheduleFullscreenViewer,
} from '../components/schedule/ScheduleHomeWidget';
import NowPlayingSquareWidget from '../components/os/NowPlayingSquareWidget';

const GLASS_CSS = `
.glass-launcher .glass-icons button>div:first-child{
  position:relative!important;
  isolation:isolate;
  overflow:hidden!important;
  background:linear-gradient(
    145deg,
    rgba(255,255,255,.15),
    rgba(255,255,255,.025) 52%,
    rgba(255,255,255,.08)
  )!important;
  border:1px solid rgba(255,255,255,.28)!important;
  border-radius:1.35rem!important;
  -webkit-backdrop-filter:blur(24px) saturate(128%)!important;
  backdrop-filter:blur(24px) saturate(128%)!important;
  box-shadow:
    inset 0 1.5px 1px rgba(255,255,255,.38),
    inset 0 -10px 20px rgba(255,255,255,.02),
    0 7px 22px rgba(12,18,28,.16)!important;
}

.glass-launcher .glass-icons button>div:first-child:before{
  content:"";
  position:absolute;
  z-index:2;
  inset:1px;
  border-radius:inherit;
  pointer-events:none;
  background:linear-gradient(
    135deg,
    rgba(255,255,255,.23),
    transparent 34%,
    transparent 72%,
    rgba(255,255,255,.045)
  );
}

.glass-launcher .glass-icons button>div:first-child:after{
  content:"";
  position:absolute;
  z-index:2;
  left:14%;
  right:30%;
  top:8%;
  height:18%;
  border-radius:999px;
  pointer-events:none;
  background:linear-gradient(
    180deg,
    rgba(255,255,255,.28),
    transparent
  );
}

.glass-launcher .glass-icons button>div:first-child>div{
  position:relative;
  z-index:1;
  color:rgba(255,255,255,.97)!important;
  filter:drop-shadow(0 1.5px 2px rgba(15,22,32,.38))!important;
}

.glass-launcher .glass-icons button>div:first-child>img{
  position:relative;
  z-index:1;
  filter:grayscale(1) saturate(0) brightness(1.12)!important;
  opacity:.82;
}

.glass-launcher .glass-icons button>span{
  text-transform:none!important;
  letter-spacing:.01em!important;
  font-weight:600!important;
  text-shadow:0 1px 5px rgba(12,18,28,.55)!important;
}

.glass-launcher .glass-dock{
  background:linear-gradient(
    145deg,
    rgba(38,46,59,.42),
    rgba(255,255,255,.075) 58%,
    rgba(255,255,255,.13)
  )!important;
  border:1px solid rgba(255,255,255,.30)!important;
  -webkit-backdrop-filter:blur(30px) saturate(135%)!important;
  backdrop-filter:blur(30px) saturate(135%)!important;
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,.36),
    0 12px 40px rgba(10,16,26,.22)!important;
}
`;

const Clock = React.memo(() => {
  const { virtualTime, theme } = useOS();
  const color = theme.contentColor || '#fff';
  const now = new Date();

  const days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  const greeting =
    virtualTime.hours < 5
      ? 'Good Night'
      : virtualTime.hours < 12
        ? 'Good Morning'
        : virtualTime.hours < 18
          ? 'Good Afternoon'
          : 'Good Evening';

  return (
    <div className="mt-5 mb-4" style={{ color }}>
      <div className="flex items-center gap-2 mb-3 opacity-90">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/20">
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{ boxShadow: '0 0 7px #4ade80' }}
          />

          <span className="text-[9px] font-bold tracking-[.2em] uppercase">
            System Online
          </span>
        </div>

        <div className="h-px flex-1 bg-current opacity-20" />

        <span className="text-[9px] tracking-[.2em] opacity-60">
          {now.getFullYear()}
        </span>
      </div>

      <div className="text-[10px] tracking-[.25em] uppercase opacity-55 font-semibold">
        {greeting}
      </div>

      <div className="flex items-end gap-3">
        <div className="text-[5.25rem] leading-[.9] font-black tracking-tighter drop-shadow-2xl">
          {String(virtualTime.hours).padStart(2, '0')}
          <span className="font-thin opacity-35 animate-pulse">
            :
          </span>
          {String(virtualTime.minutes).padStart(2, '0')}
        </div>

        <div className="pb-2">
          <div className="text-[9px] font-bold tracking-[.18em]">
            {days[now.getDay()]}
          </div>

          <div className="text-xl font-black">
            {String(now.getDate()).padStart(2, '0')}{' '}
            <span className="text-[9px] tracking-[.18em] opacity-65">
              {months[now.getMonth()]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

const CharacterCard = React.memo(
  ({
    char,
    unread,
    message,
    onClick,
  }: {
    char: CharacterProfile | null;
    unread: number;
    message: string;
    onClick: () => void;
  }) => {
    const { theme } = useOS();
    const color = theme.contentColor || '#fff';

    return (
      <button
        onClick={onClick}
        className="w-full h-[88px] mb-4 rounded-[1.7rem] overflow-hidden relative text-left active:scale-[.985] transition-transform border border-white/20"
        style={{
          background: 'rgba(255,255,255,.11)',
          backdropFilter: 'blur(24px) saturate(1.35)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.35)',
          boxShadow:
            'inset 0 1px rgba(255,255,255,.2),0 9px 28px rgba(0,0,0,.14)',
          color,
        }}
      >
        {char?.avatar && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${char.avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(28px)',
              transform: 'scale(1.3)',
            }}
          />
        )}

        <div className="relative h-full flex items-center gap-3 px-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black/20 border border-white/30 shrink-0">
            {char?.avatar ? (
              <img
                src={char.avatar}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-2xl">
                ♡
              </div>
            )}

            <span className="absolute right-1 bottom-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white/50" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <b className="text-[15px] truncate">
                {char?.name || 'Sully'}
              </b>

              {unread > 0 && (
                <span className="text-[8px] px-1.5 py-.5 rounded-full bg-red-500 text-white font-bold">
                  {unread} NEW
                </span>
              )}
            </div>

            <p className="text-[11px] opacity-75 line-clamp-2 mt-1">
              ▶ {message || 'System Ready.'}
            </p>
          </div>
        </div>
      </button>
    );
  },
);

const AppGrid = React.memo(
  ({
    apps,
    openApp,
    compact = false,
  }: {
    apps: typeof INSTALLED_APPS;
    openApp: (id: AppID) => void;
    compact?: boolean;
  }) => (
    <div
      className={`glass-icons grid place-items-center ${
        compact
          ? 'grid-cols-2 grid-rows-2 gap-y-3 gap-x-3'
          : 'grid-cols-4 gap-y-5 gap-x-2'
      }`}
    >
      {apps.map((app) => (
        <div
          key={app.id}
          className="active:scale-95 transition-transform"
        >
          <AppIcon
            app={app}
            onClick={() => openApp(app.id)}
            size="lg"
          />
        </div>
      ))}
    </div>
  ),
);

const CalendarPage = React.memo(
  ({ color }: { color: string }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const count = new Date(year, month + 1, 0).getDate();
    const offset = new Date(year, month, 1).getDay();

    const names = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];

    return (
      <div
        className="h-full w-full px-6 pt-24 pb-32"
        style={{ color }}
      >
        <div
          className="rounded-[2rem] p-6 bg-white/15 border border-white/25 shadow-2xl"
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <h2 className="text-xl font-bold tracking-[.15em] mb-5">
            {names[month]} {year}
          </h2>

          <div className="grid grid-cols-7 gap-y-3 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
              (day, index) => (
                <div
                  key={index}
                  className="text-[10px] opacity-45 font-bold"
                >
                  {day}
                </div>
              ),
            )}

            {Array.from({ length: offset }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from(
              { length: count },
              (_, index) => index + 1,
            ).map((day) => (
              <div
                key={day}
                className={`h-8 grid place-items-center text-sm ${
                  day === now.getDate()
                    ? 'rounded-full bg-white text-black font-bold shadow-lg'
                    : 'opacity-80'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-5 rounded-[2rem] p-5 bg-white/12 border border-white/20 min-h-40"
          style={{
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          }}
        >
          <div className="text-[11px] uppercase tracking-[.2em] font-bold opacity-60">
            Upcoming Events
          </div>

          <div className="h-28 grid place-items-center text-xs opacity-40">
            No upcoming events
          </div>
        </div>
      </div>
    );
  },
);

let rememberedPage = 0;

const Launcher: React.FC = () => {
  const {
    openApp,
    characters,
    activeCharacterId,
    theme,
    lastMsgTimestamp,
    isDataLoaded,
    unreadMessages,
  } = useOS();

  const [char, setChar] =
    useState<CharacterProfile | null>(null);

  const [message, setMessage] =
    useState('System Ready.');

  const [schedule, setSchedule] =
    useState<DailySchedule | null>(null);

  const [scheduleOpen, setScheduleOpen] =
    useState(false);

  const [page, setPage] =
    useState(rememberedPage);

  const scroller = useRef<HTMLDivElement>(null);
  const color = theme.contentColor || '#fff';

  const apps = useMemo(
    () =>
      INSTALLED_APPS.filter(
        (app) =>
          !DOCK_APPS.includes(app.id) &&
          app.id !== AppID.CharCreatorDev,
      ),
    [],
  );

  const dockApps = useMemo(
    () =>
      DOCK_APPS.map((id) =>
        INSTALLED_APPS.find((app) => app.id === id),
      ).filter(Boolean) as typeof INSTALLED_APPS,
    [],
  );

  const pages = useMemo(() => {
    const result: typeof INSTALLED_APPS[] = [];

    for (
      let index = 0;
      index < apps.length;
      index += 8
    ) {
      result.push(apps.slice(index, index + 8));
    }

    while (result.length < 3) {
      result.push([]);
    }

    return result;
  }, [apps]);

  useEffect(() => {
    if (!isDataLoaded || !characters.length) {
      setChar(null);
      return;
    }

    const current =
      characters.find(
        (character) =>
          character.id === activeCharacterId,
      ) || characters[0];

    setChar(current);

    DB.getMessagesByCharId(current.id)
      .then((messages) => {
        const visible = messages.filter(
          (item) => item.role !== 'system',
        );

        const last = visible[visible.length - 1];

        setMessage(
          last?.content
            ?.replace(/\[.*?\]/g, '')
            .trim() ||
            current.description ||
            'System Ready.',
        );
      })
      .catch(() => {
        setMessage(
          current.description || 'System Ready.',
        );
      });

    const date =
      new Date().toISOString().split('T')[0];

    DB.getDailySchedule(current.id, date)
      .then(setSchedule)
      .catch(() => setSchedule(null));
  }, [
    characters,
    activeCharacterId,
    lastMsgTimestamp,
    isDataLoaded,
  ]);

  useEffect(() => {
    const element = scroller.current;

    if (element && rememberedPage) {
      requestAnimationFrame(() => {
        element.scrollLeft =
          element.clientWidth * rememberedPage;
      });
    }
  }, []);

  const onScroll = () => {
    if (!scroller.current) return;

    const next = Math.round(
      scroller.current.scrollLeft /
        scroller.current.clientWidth,
    );

    setPage(next);
    rememberedPage = next;
  };

  const totalUnread =
    Object.values(unreadMessages).reduce(
      (total, count) => total + count,
      0,
    );

  const characterUnread = char
    ? unreadMessages[char.id] || 0
    : 0;

  const totalPages = pages.length + 1;

  return (
    <div className="glass-launcher h-full w-full relative overflow-hidden select-none">
      <style>{GLASS_CSS}</style>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_5%,rgba(255,255,255,.1),transparent_32%),radial-gradient(circle_at_5%_95%,rgba(100,170,255,.1),transparent_35%)]" />

      <div
        ref={scroller}
        onScroll={onScroll}
        className="h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {pages.map((pageApps, index) => (
          <section
            key={index}
            className="w-full h-full shrink-0 snap-center px-5 pt-12 pb-32 flex flex-col"
          >
            {index === 0 ? (
              <>
                <Clock />

                <CharacterCard
                  char={char}
                  unread={characterUnread}
                  message={message}
                  onClick={() =>
                    openApp(AppID.Chat)
                  }
                />

                <div className="flex-1">
                  <AppGrid
                    apps={pageApps}
                    openApp={openApp}
                  />
                </div>
              </>
            ) : index === 1 ? (
              <div className="flex-1 min-h-0 flex flex-col justify-center gap-4">
                {char && (
                  <ScheduleHomeWidget
                    schedule={schedule}
                    character={char}
                    contentColor={color}
                    onOpen={() =>
                      setScheduleOpen(true)
                    }
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square">
                    <NowPlayingSquareWidget
                      contentColor={color}
                    />
                  </div>

                  <div className="aspect-square grid place-items-center">
                    <AppGrid
                      apps={pageApps.slice(0, 4)}
                      openApp={openApp}
                      compact
                    />
                  </div>

                  <div className="aspect-square grid place-items-center">
                    <AppGrid
                      apps={pageApps.slice(4, 8)}
                      openApp={openApp}
                      compact
                    />
                  </div>

                  <button
                    onClick={() =>
                      openApp(AppID.Appearance)
                    }
                    className="aspect-square rounded-[1.75rem] overflow-hidden border border-white/25 bg-white/15 active:scale-[.98] transition-transform"
                    style={{
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter:
                        'blur(20px)',
                    }}
                  >
                    {theme.launcherWidgets?.['dsq'] ? (
                      <img
                        src={
                          theme.launcherWidgets['dsq']
                        }
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div
                        className="h-full grid place-items-center text-center"
                        style={{ color }}
                      >
                        <div>
                          <div className="text-3xl opacity-65">
                            ◇
                          </div>

                          <div className="text-[10px] uppercase tracking-[.18em] opacity-55 mt-2">
                            Add Image
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 pt-12">
                <AppGrid
                  apps={pageApps}
                  openApp={openApp}
                />
              </div>
            )}
          </section>
        ))}

        <section className="w-full h-full shrink-0 snap-center">
          <CalendarPage color={color} />
        </section>
      </div>

      <div className="absolute left-0 right-0 bottom-[7.25rem] flex justify-center gap-2 pointer-events-none">
        {Array.from({
          length: totalPages,
        }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              page === index
                ? 'w-4 opacity-100'
                : 'w-1.5 opacity-40'
            }`}
            style={{ background: color }}
          />
        ))}
      </div>

      <div className="absolute left-0 right-0 bottom-5 px-4 flex justify-center">
        <div className="glass-icons glass-dock rounded-[1.8rem] px-4 py-3 flex items-center justify-center gap-3 sm:gap-6 max-w-full overflow-x-auto no-scrollbar">
          {dockApps.map((app) => (
            <div
              key={app.id}
              className="relative shrink-0"
            >
              <AppIcon
                app={app}
                onClick={() => openApp(app.id)}
                variant="dock"
                size="lg"
              />

              {app.id === AppID.Chat &&
                totalUnread > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center border-2 border-white/30">
                    {totalUnread > 9
                      ? '9+'
                      : totalUnread}
                  </span>
                )}
            </div>
          ))}
        </div>
      </div>

      <ScheduleFullscreenViewer
        open={scheduleOpen}
        onClose={() =>
          setScheduleOpen(false)
        }
        characters={characters}
        activeCharId={char?.id || null}
        onSwitchCharacter={() => {}}
        schedule={schedule}
        activeCharacter={char}
        contentColor={color}
      />
    </div>
  );
};

export default Launcher;