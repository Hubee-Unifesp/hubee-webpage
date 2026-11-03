"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMemberProfile } from "./team.config";
import { TeamMemberDialog } from "./team-member-dialog";

const LINEAR_SPEED_PX_PER_SEC = 52;
const DESKTOP_VISIBLE_COUNT = 4;
const DRAG_THRESHOLD_PX = 6;

interface TeamCarouselProps {
  members: readonly TeamMemberProfile[];
}

export function TeamCarousel({ members }: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isTrackHovered, setIsTrackHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberProfile | null>(null);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>(
    {},
  );

  const trackRef = useRef<HTMLUListElement | null>(null);
  const scrollPosRef = useRef<number>(0);
  const pendingOffsetRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const didDragRef = useRef<boolean>(false);
  const pointerStartXRef = useRef<number>(0);
  const dragStartScrollRef = useRef<number>(0);
  const cardButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastOpenedMemberIdRef = useRef<string | null>(null);

  const total = members.length;
  const canScroll = total > 1;

  // Triplica a lista para garantir loop linear infinito em ambos os sentidos
  const extendedMembers = useMemo(() => {
    if (!canScroll) return [...members];
    return [...members, ...members, ...members];
  }, [canScroll, members]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  /** Mede a largura de 1 cartão + gap e a largura total de 1 conjunto completo (`total` cartões). */
  const getTrackMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < total + 1) {
      return { cardStepPx: 288, singleSetWidth: total * 288 };
    }
    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    const middleStart = track.children[total] as HTMLElement;

    const cardStepPx = Math.max(1, second.offsetLeft - first.offsetLeft);
    const singleSetWidth = Math.max(
      cardStepPx * total,
      middleStart.offsetLeft - first.offsetLeft,
    );

    return { cardStepPx, singleSetWidth };
  }, [total]);

  /** Mantém qualquer posição de scroll sempre dentro da cópia central `[singleSetWidth, singleSetWidth * 2)`. */
  const normalizeCircularPosition = useCallback(
    (rawPos: number, singleSetWidth: number): number => {
      if (singleSetWidth <= 0) return rawPos;
      let pos = rawPos;
      while (pos >= singleSetWidth * 2) {
        pos -= singleSetWidth;
      }
      while (pos < singleSetWidth) {
        pos += singleSetWidth;
      }
      return pos;
    },
    [],
  );

  const syncCurrentIndexFromScroll = useCallback(
    (pos: number, singleSetWidth: number, cardStepPx: number) => {
      if (total === 0 || cardStepPx <= 0) return;
      const relative = pos - singleSetWidth;
      const rawIdx = Math.round(relative / cardStepPx);
      const normalizedIdx = ((rawIdx % total) + total) % total;
      setCurrentIndex((prev) => (prev === normalizedIdx ? prev : normalizedIdx));
    },
    [total],
  );

  // Posiciona inicialmente no começo da cópia central
  useEffect(() => {
    if (!canScroll || !trackRef.current) return;
    const { singleSetWidth } = getTrackMetrics();
    scrollPosRef.current = singleSetWidth;
    trackRef.current.scrollLeft = singleSetWidth;
  }, [canScroll, getTrackMetrics]);

  const isDialogOpen = selectedMember !== null;
  const isAutoplayActive =
    canScroll &&
    !prefersReducedMotion &&
    !isManuallyPaused &&
    !isTrackHovered &&
    !isDragging &&
    !isDialogOpen;

  // Loop contínuo em requestAnimationFrame (movimento linear + amortecimento suave para setas)
  useEffect(() => {
    if (!canScroll) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const tick = (now: number) => {
      const dtSeconds = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      const track = trackRef.current;
      if (track && !isPointerDownRef.current) {
        const { cardStepPx, singleSetWidth } = getTrackMetrics();
        let delta = 0;

        // Deslocamento linear contínuo quando em Play
        if (isAutoplayActive && !document.hidden) {
          delta += LINEAR_SPEED_PX_PER_SEC * dtSeconds;
        }

        // Deslocamento suave acumulado quando o usuário clica nas setas < ou >
        if (Math.abs(pendingOffsetRef.current) > 0.5) {
          const step = pendingOffsetRef.current * Math.min(1, dtSeconds * 10);
          delta += step;
          pendingOffsetRef.current -= step;
        } else if (pendingOffsetRef.current !== 0) {
          delta += pendingOffsetRef.current;
          pendingOffsetRef.current = 0;
        }

        if (delta !== 0) {
          const nextPos = normalizeCircularPosition(
            scrollPosRef.current + delta,
            singleSetWidth,
          );
          scrollPosRef.current = nextPos;
          track.scrollLeft = nextPos;
          syncCurrentIndexFromScroll(nextPos, singleSetWidth, cardStepPx);
        }
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [
    canScroll,
    getTrackMetrics,
    isAutoplayActive,
    normalizeCircularPosition,
    syncCurrentIndexFromScroll,
  ]);

  const handleStepButton = useCallback(
    (direction: 1 | -1) => {
      if (!canScroll) return;
      const { cardStepPx, singleSetWidth } = getTrackMetrics();
      if (prefersReducedMotion && trackRef.current) {
        const nextPos = normalizeCircularPosition(
          scrollPosRef.current + direction * cardStepPx,
          singleSetWidth,
        );
        scrollPosRef.current = nextPos;
        trackRef.current.scrollLeft = nextPos;
        syncCurrentIndexFromScroll(nextPos, singleSetWidth, cardStepPx);
      } else {
        pendingOffsetRef.current += direction * cardStepPx;
      }
    },
    [
      canScroll,
      getTrackMetrics,
      normalizeCircularPosition,
      prefersReducedMotion,
      syncCurrentIndexFromScroll,
    ],
  );

  const jumpToMemberIndex = useCallback(
    (targetIdx: number) => {
      if (!canScroll || total === 0) return;
      const { cardStepPx, singleSetWidth } = getTrackMetrics();
      const targetPos = singleSetWidth + targetIdx * cardStepPx;
      const diff = targetPos - scrollPosRef.current;

      if (prefersReducedMotion && trackRef.current) {
        scrollPosRef.current = targetPos;
        trackRef.current.scrollLeft = targetPos;
        setCurrentIndex(targetIdx);
      } else {
        pendingOffsetRef.current = diff;
      }
    },
    [canScroll, getTrackMetrics, prefersReducedMotion, total],
  );

  // Handlers de arraste ("segurar sobre a foto e puxar")
  const handlePointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (!canScroll || event.button !== 0) return;
    isPointerDownRef.current = true;
    didDragRef.current = false;
    pendingOffsetRef.current = 0;
    pointerStartXRef.current = event.clientX;
    dragStartScrollRef.current = scrollPosRef.current;
  };

  const handlePointerMove = (event: PointerEvent<HTMLUListElement>) => {
    if (!isPointerDownRef.current || !trackRef.current) return;
    const deltaX = event.clientX - pointerStartXRef.current;

    if (!didDragRef.current && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
      setIsDragging(true);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Ignora caso o ponteiro não suporte captura
      }
    }

    if (didDragRef.current) {
      const { cardStepPx, singleSetWidth } = getTrackMetrics();
      const nextPos = normalizeCircularPosition(
        dragStartScrollRef.current - deltaX,
        singleSetWidth,
      );
      scrollPosRef.current = nextPos;
      trackRef.current.scrollLeft = nextPos;
      syncCurrentIndexFromScroll(nextPos, singleSetWidth, cardStepPx);
    }
  };

  const endPointerDrag = (event: PointerEvent<HTMLUListElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignora caso o ponteiro já tenha sido liberado
    }
  };

  // Se o usuário segurou e puxou para rolar, bloqueia o click para não abrir o modal acidentalmente
  const handleTrackClickCapture = (event: MouseEvent<HTMLUListElement>) => {
    if (didDragRef.current) {
      event.preventDefault();
      event.stopPropagation();
      didDragRef.current = false;
    }
  };

  const handleOpenMember = (member: TeamMemberProfile, logicalIdx: number) => {
    if (didDragRef.current) return;
    lastOpenedMemberIdRef.current = member.id;
    setCurrentIndex(logicalIdx);
    setSelectedMember(member);
  };

  const handleCloseAutoFocus = (event: Event) => {
    const memberId = lastOpenedMemberIdRef.current;
    if (memberId && cardButtonRefs.current[memberId]) {
      event.preventDefault();
      cardButtonRefs.current[memberId]?.focus();
    }
  };

  const visibleEndLogical =
    ((currentIndex + DESKTOP_VISIBLE_COUNT - 1) % total) + 1;
  const rangeLabelDesktop =
    total <= DESKTOP_VISIBLE_COUNT
      ? `${total} integrantes · todos visíveis`
      : `${currentIndex + 1}–${visibleEndLogical} de ${total}`;
  const rangeLabelMobile = `${currentIndex + 1} de ${total}`;

  return (
    <section
      aria-labelledby="nosso-time-titulo"
      aria-roledescription="carrossel"
      className="py-12 md:py-16"
    >
      <div className="space-y-2">
        <h2
          id="nosso-time-titulo"
          className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
        >
          Nosso time
        </h2>
        <p className="text-base text-hubee-750 dark:text-hubee-50/90">
          As pessoas por trás do Hubee. Arraste para navegar ou clique na foto
          de um integrante para abrir seu README do GitHub.
        </p>
      </div>

      <ul
        ref={trackRef}
        aria-label="Nosso time"
        onMouseEnter={() => setIsTrackHovered(true)}
        onMouseLeave={() => setIsTrackHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onClickCapture={handleTrackClickCapture}
        className={cn(
          "mt-8 flex gap-6 overflow-x-hidden pb-4 select-none touch-pan-y",
          canScroll && (isDragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        {extendedMembers.map((member, domIdx) => {
          const logicalIdx = domIdx % total;
          const isMiddleCopy =
            !canScroll || (domIdx >= total && domIdx < total * 2);
          const imgFailed = Boolean(failedAvatars[member.id]);

          return (
            <li
              key={`${member.id}-copy-${domIdx}`}
              aria-hidden={!isMiddleCopy ? "true" : undefined}
              className="w-[280px] shrink-0 md:w-[264px]"
            >
              <button
                ref={(el) => {
                  if (isMiddleCopy) {
                    cardButtonRefs.current[member.id] = el;
                  }
                }}
                type="button"
                draggable={false}
                tabIndex={isMiddleCopy ? 0 : -1}
                aria-haspopup="dialog"
                aria-label={`Ver apresentação e README de ${member.name}`}
                onDragStart={(e) => e.preventDefault()}
                onClick={() => handleOpenMember(member, logicalIdx)}
                className={cn(
                  "group flex h-full w-full flex-col overflow-hidden rounded-xl border border-hubee-200 bg-hubee-neutral-25 text-left transition-colors outline-none hover:border-hubee-400 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 focus-visible:ring-offset-hubee-50 dark:border-hubee-50/15 dark:bg-hubee-800/80 dark:hover:border-hubee-400 dark:focus-visible:ring-hubee-400 dark:focus-visible:ring-offset-hubee-800",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                )}
              >
                <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden bg-hubee-100 p-5 dark:bg-hubee-900">
                  {!imgFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={member.avatarUrl}
                      alt={`Foto de ${member.name}`}
                      loading="lazy"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onError={() =>
                        setFailedAvatars((prev) => ({
                          ...prev,
                          [member.id]: true,
                        }))
                      }
                      className="pointer-events-none size-28 rounded-full border-2 border-hubee-200 object-cover transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none dark:border-hubee-750"
                    />
                  ) : (
                    <div className="pointer-events-none flex size-28 items-center justify-center rounded-full border border-hubee-200 bg-hubee-50 text-hubee-750 dark:border-hubee-750 dark:bg-hubee-800 dark:text-hubee-200">
                      <User
                        aria-hidden="true"
                        className="size-10 stroke-[1.5]"
                      />
                    </div>
                  )}
                  <span className="pointer-events-none mt-2.5 text-xs font-medium text-hubee-750 group-hover:underline dark:text-hubee-200">
                    @{member.username} · ver README
                  </span>
                </div>

                <div className="pointer-events-none flex flex-1 flex-col justify-between p-4">
                  <h3 className="text-base font-bold text-hubee-800 dark:text-hubee-50">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-hubee-750 dark:text-hubee-200">
                    {member.role}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Barra de posição e controles manuais acessíveis */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5"
            role="group"
            aria-label="Posição no carrossel"
          >
            {members.map((member, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => jumpToMemberIndex(idx)}
                  aria-label={`Ir para ${member.name}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400",
                    isCurrent
                      ? "w-5 bg-hubee-800 dark:bg-hubee-400"
                      : "w-2 bg-hubee-200 hover:bg-hubee-400 dark:bg-hubee-750 dark:hover:bg-hubee-600",
                  )}
                />
              );
            })}
          </div>
          <span className="hidden text-xs font-medium text-hubee-750 md:inline dark:text-hubee-200">
            {rangeLabelDesktop}
          </span>
          <span className="text-xs font-medium text-hubee-750 md:hidden dark:text-hubee-200">
            {rangeLabelMobile}
          </span>
        </div>

        {canScroll && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStepButton(-1)}
              aria-label="Mostrar integrantes anteriores"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-hubee-200 bg-hubee-neutral-25 text-hubee-800 transition-colors outline-none hover:bg-hubee-100 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>

            {!prefersReducedMotion && (
              <button
                type="button"
                onClick={() => setIsManuallyPaused((prev) => !prev)}
                aria-label={
                  isManuallyPaused
                    ? "Retomar avanço automático"
                    : "Pausar avanço automático"
                }
                aria-pressed={isManuallyPaused}
                className="inline-flex size-11 items-center justify-center rounded-lg border border-hubee-200 bg-hubee-neutral-25 text-hubee-800 transition-colors outline-none hover:bg-hubee-100 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
              >
                {isManuallyPaused ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <Pause aria-hidden="true" className="size-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleStepButton(1)}
              aria-label="Mostrar próximos integrantes"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-hubee-200 bg-hubee-neutral-25 text-hubee-800 transition-colors outline-none hover:bg-hubee-100 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>

      <TeamMemberDialog
        member={selectedMember}
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
        onCloseAutoFocus={handleCloseAutoFocus}
      />
    </section>
  );
}
