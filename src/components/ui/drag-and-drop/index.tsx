"use client";

import React, {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  closestCorners,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

export type DragDropOrientation = "vertical" | "horizontal";

export type DragDropItems =
  UniqueIdentifier[] | Record<string, UniqueIdentifier[]>;

type OverlayEntry = {
  children: ReactNode;
  className?: string;
};

type DragDropContextValue = {
  orientation: DragDropOrientation;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  disabledIds: ReadonlySet<UniqueIdentifier>;
  isMulti: boolean;
  /** Single-list item ids when not using multiple containers. */
  singleItems: UniqueIdentifier[] | null;
  findContainer: (id: UniqueIdentifier) => string | undefined;
  registerOverlay: (id: UniqueIdentifier, entry: OverlayEntry | null) => void;
};

const DragDropContext = createContext<DragDropContextValue | null>(null);
const DragDropItemContext = createContext<{
  handleProps: HTMLAttributes<HTMLElement> & {
    ref?: (node: HTMLElement | null) => void;
  };
  registerHandle: (present: boolean) => void;
  isDragging: boolean;
  disabled: boolean;
} | null>(null);

function useDragDropContext(component: string) {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error(`${component} must be used within <DragDrop>.`);
  }
  return context;
}

function isMultiItems(
  items: DragDropItems,
): items is Record<string, UniqueIdentifier[]> {
  return !Array.isArray(items);
}

function flattenItems(items: DragDropItems): UniqueIdentifier[] {
  if (Array.isArray(items)) {
    return items;
  }
  return Object.values(items).flat();
}

/**
 * Board collision detection (after the dnd-kit multiple-containers recipe).
 * `closestCorners` alone keeps choosing cards in a neighboring column, so an
 * emptied column could never receive an item again. Prefer what the pointer
 * is inside, then rect overlap; a hit on a non-empty column resolves to its
 * closest card, and a hit on an empty column returns the column itself.
 */
function boardCollisionDetection(
  items: Record<string, UniqueIdentifier[]>,
): CollisionDetection {
  return (args) => {
    const pointerHits = pointerWithin(args);
    const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
    let overId = getFirstCollision(hits, "id");

    if (overId == null) {
      // Keyboard dragging has no pointer; fall back to corner distance.
      return closestCorners(args);
    }

    const containerItems = items[String(overId)];

    if (containerItems && containerItems.length > 0) {
      overId =
        closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) =>
              container.id !== overId && containerItems.includes(container.id),
          ),
        })[0]?.id ?? overId;
    }

    return [{ id: overId }];
  };
}

function findContainerId(
  items: Record<string, UniqueIdentifier[]>,
  id: UniqueIdentifier,
): string | undefined {
  if (id in items) {
    return String(id);
  }
  return Object.keys(items).find((key) => items[key]?.includes(id));
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

const defaultAnnouncements = {
  onDragStart({ active }: { active: { id: UniqueIdentifier } }) {
    return `Picked up item ${String(active.id)}.`;
  },
  onDragOver({
    active,
    over,
  }: {
    active: { id: UniqueIdentifier };
    over: { id: UniqueIdentifier } | null;
  }) {
    if (!over) {
      return `Item ${String(active.id)} is no longer over a droppable area.`;
    }
    return `Item ${String(active.id)} was moved over ${String(over.id)}.`;
  },
  onDragEnd({
    active,
    over,
  }: {
    active: { id: UniqueIdentifier };
    over: { id: UniqueIdentifier } | null;
  }) {
    if (!over) {
      return `Item ${String(active.id)} was dropped.`;
    }
    return `Item ${String(active.id)} was dropped over ${String(over.id)}.`;
  },
  onDragCancel({ active }: { active: { id: UniqueIdentifier } }) {
    return `Dragging was cancelled. Item ${String(active.id)} was dropped.`;
  },
};

export type DragDropProps = {
  items: DragDropItems;
  onReorder: (items: DragDropItems) => void;
  orientation?: DragDropOrientation;
  /** Item ids that cannot be dragged. */
  disabledIds?: readonly UniqueIdentifier[];
  /**
   * Stable id for `@dnd-kit` accessibility markup.
   * Defaults to React `useId()` so SSR and hydration match.
   */
  id?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Sortable / reorderable drag-and-drop root.
 * Not a file-upload drop zone — use File Upload for that.
 *
 * Backed by `@dnd-kit` for pointer, touch, and keyboard sensors.
 */
export function DragDrop({
  items,
  onReorder,
  orientation = "vertical",
  disabledIds = [],
  id,
  children,
  className,
}: DragDropProps) {
  const reactId = useId();
  const dndId = id ?? reactId;
  const multi = isMultiItems(items);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [activeSize, setActiveSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [overlaySnapshot, setOverlaySnapshot] = useState<OverlayEntry | null>(
    null,
  );
  const overlayRegistry = React.useRef(
    new Map<UniqueIdentifier, OverlayEntry>(),
  );
  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds]);

  const registerOverlay = React.useCallback(
    (id: UniqueIdentifier, entry: OverlayEntry | null) => {
      if (entry) {
        overlayRegistry.current.set(id, entry);
      } else {
        overlayRegistry.current.delete(id);
      }
    },
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const contextValue = useMemo<DragDropContextValue>(
    () => ({
      orientation,
      activeId,
      overId,
      disabledIds: disabledSet,
      isMulti: multi,
      singleItems: multi ? null : (items as UniqueIdentifier[]),
      findContainer: (id: UniqueIdentifier) => {
        if (!multi) {
          return "default";
        }
        return findContainerId(items as Record<string, UniqueIdentifier[]>, id);
      },
      registerOverlay,
    }),
    [orientation, activeId, overId, disabledSet, multi, items, registerOverlay],
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (disabledSet.has(event.active.id)) {
      return;
    }
    const rect = event.active.rect.current.initial;
    setActiveId(event.active.id);
    setOverId(event.active.id);
    setActiveSize(rect ? { width: rect.width, height: rect.height } : null);
    // Snapshot content so multi-container moves can unmount the source item.
    setOverlaySnapshot(overlayRegistry.current.get(event.active.id) ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    setOverId(over?.id ?? null);

    if (!multi || !over || active.id === over.id) {
      return;
    }

    const activeContainer = findContainerId(items, active.id);
    const overContainer =
      findContainerId(items, over.id) ??
      (over.id in items ? String(over.id) : undefined);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    const activeItems = items[activeContainer] ?? [];
    const overItems = items[overContainer] ?? [];
    const activeIndex = activeItems.indexOf(active.id);
    const overIndex = overItems.indexOf(over.id);
    const nextIndex = overIndex >= 0 ? overIndex : overItems.length;

    if (activeIndex < 0) {
      return;
    }

    const next: Record<string, UniqueIdentifier[]> = {
      ...items,
      [activeContainer]: activeItems.filter((id) => id !== active.id),
      [overContainer]: [
        ...overItems.slice(0, nextIndex),
        active.id,
        ...overItems.slice(nextIndex),
      ],
    };
    onReorder(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setActiveSize(null);
    setOverlaySnapshot(null);

    if (!over || active.id === over.id) {
      return;
    }

    if (!multi) {
      const list = items as UniqueIdentifier[];
      const oldIndex = list.indexOf(active.id);
      const newIndex = list.indexOf(over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }
      onReorder(arrayMove(list, oldIndex, newIndex));
      return;
    }

    const activeContainer = findContainerId(items, active.id);
    const overContainer =
      findContainerId(items, over.id) ??
      (over.id in items ? String(over.id) : undefined);

    if (!activeContainer || !overContainer) {
      return;
    }

    if (activeContainer === overContainer) {
      const list = items[activeContainer] ?? [];
      const oldIndex = list.indexOf(active.id);
      // Dropping on the empty container (or column chrome) keeps current order.
      if (over.id === overContainer || over.id === activeContainer) {
        return;
      }
      const newIndex = list.indexOf(over.id);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return;
      }
      onReorder({
        ...items,
        [activeContainer]: arrayMove(list, oldIndex, newIndex),
      });
      return;
    }

    // Safety net when dragOver did not move into an empty column yet.
    const activeItems = items[activeContainer] ?? [];
    const overItems = items[overContainer] ?? [];
    const activeIndex = activeItems.indexOf(active.id);
    if (activeIndex < 0) {
      return;
    }
    onReorder({
      ...items,
      [activeContainer]: activeItems.filter((id) => id !== active.id),
      [overContainer]: [...overItems, active.id],
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setActiveSize(null);
    setOverlaySnapshot(null);
  };

  const overlayEntry = activeId ? overlaySnapshot : null;

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={
          multi
            ? boardCollisionDetection(
                items as Record<string, UniqueIdentifier[]>,
              )
            : closestCenter
        }
        accessibility={{ announcements: defaultAnnouncements }}
        onDragStart={handleDragStart}
        onDragOver={multi ? handleDragOver : undefined}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          data-slot="drag-drop"
          data-orientation={orientation}
          className={cn("relative w-full min-w-0", className)}
        >
          {children}
        </div>
        <DragOverlay dropAnimation={dropAnimation} adjustScale={false}>
          {activeId && overlayEntry ? (
            <DragDropItemContext.Provider
              value={{
                handleProps: {},
                registerHandle: () => undefined,
                isDragging: true,
                disabled: true,
              }}
            >
              <div
                data-slot="drag-drop-overlay"
                style={
                  activeSize
                    ? {
                        width: activeSize.width,
                        height: activeSize.height,
                        boxSizing: "border-box",
                      }
                    : undefined
                }
                className={cn(
                  "border-border bg-card text-card-foreground cursor-grabbing rounded-md border shadow-lg",
                  overlayEntry.className,
                )}
              >
                {overlayEntry.children}
              </div>
            </DragDropItemContext.Provider>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
}

export type DragDropListProps = {
  /** Required when using multiple containers. */
  id?: string;
  items?: UniqueIdentifier[];
  children: ReactNode;
  className?: string;
  strategy?: SortingStrategy;
};

/**
 * Sortable list / column. Pass `id` + the container's item ids for boards.
 * In multi-container mode the list itself is droppable so empty columns can
 * receive items again.
 */
export function DragDropList({
  id = "default",
  items,
  children,
  className,
  strategy,
}: DragDropListProps) {
  const { orientation, isMulti, singleItems, activeId, overId } =
    useDragDropContext("DragDropList");
  const sortingStrategy =
    strategy ??
    (orientation === "horizontal"
      ? horizontalListSortingStrategy
      : verticalListSortingStrategy);

  const listItems = items ?? singleItems ?? [];

  if (isMulti && !items) {
    throw new Error(
      "DragDropList requires an `items` prop when DragDrop uses multiple containers.",
    );
  }

  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !isMulti,
    data: {
      type: "container",
      children: listItems,
    },
  });

  const isEmptyDropTarget =
    isMulti &&
    activeId !== null &&
    listItems.length === 0 &&
    (isOver || overId === id);

  return (
    <SortableContext id={id} items={listItems} strategy={sortingStrategy}>
      <div
        ref={setNodeRef}
        data-slot="drag-drop-list"
        data-drag-drop-list={id}
        data-empty-drop-target={isEmptyDropTarget ? "" : undefined}
        className={cn(
          "flex min-w-0",
          orientation === "horizontal" ? "flex-row gap-2" : "flex-col gap-2",
          isEmptyDropTarget &&
            "bg-primary/5 ring-primary/35 rounded-md ring-2 ring-inset",
          className,
        )}
      >
        {children}
      </div>
    </SortableContext>
  );
}

export type DragDropItemProps = {
  id: UniqueIdentifier;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Sortable item. Use DragDropHandle so nested buttons/links stay interactive.
 */
export function DragDropItem({
  id,
  disabled = false,
  children,
  className,
  style,
}: DragDropItemProps) {
  const { orientation, overId, activeId, disabledIds, registerOverlay } =
    useDragDropContext("DragDropItem");
  const isDisabled = disabled || disabledIds.has(id);

  const [hasHandle, setHasHandle] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isDisabled,
  });

  React.useLayoutEffect(() => {
    registerOverlay(id, { children, className });
    return () => registerOverlay(id, null);
  }, [id, children, className, registerOverlay]);

  const showIndicator = overId === id && activeId !== null && activeId !== id;

  const itemStyle: CSSProperties = {
    transform: CSS.Transform.toString(
      transform
        ? {
            ...transform,
            // Keep the in-list ghost from scaling while the overlay holds size.
            scaleX: 1,
            scaleY: 1,
          }
        : null,
    ),
    transition,
    ...style,
  };

  const handleProps = {
    ref: setActivatorNodeRef,
    ...listeners,
    ...attributes,
  };

  return (
    <DragDropItemContext.Provider
      value={{
        handleProps,
        registerHandle: setHasHandle,
        isDragging,
        disabled: isDisabled,
      }}
    >
      <div
        ref={setNodeRef}
        data-slot="drag-drop-item"
        data-dragging={isDragging ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        data-drop-target={showIndicator ? "" : undefined}
        style={itemStyle}
        className={cn(
          "border-border bg-card text-card-foreground relative rounded-md border",
          "transition-[opacity,box-shadow,background-color] duration-150 ease-linear",
          "motion-reduce:transition-none",
          !isDisabled && "hover:bg-accent/40",
          isDragging && "z-10 opacity-30 shadow-none",
          isDisabled && "opacity-60",
          !hasHandle && !isDisabled && "touch-none",
          className,
        )}
        {...(!hasHandle && !isDisabled ? { ...listeners, ...attributes } : {})}
      >
        {showIndicator ? <DragDropIndicator orientation={orientation} /> : null}
        {children}
      </div>
    </DragDropItemContext.Provider>
  );
}

export type DragDropHandleProps = HTMLAttributes<HTMLButtonElement>;

/**
 * Drag activator. Prefer this over making the whole item draggable when the
 * item contains buttons, links, or inputs.
 */
export function DragDropHandle({
  className,
  children,
  "aria-label": ariaLabel = "Reorder",
  ...props
}: DragDropHandleProps) {
  const item = useContext(DragDropItemContext);
  if (!item) {
    throw new Error("DragDropHandle must be used within DragDropItem.");
  }

  const { handleProps, registerHandle, disabled } = item;
  const { ref, ...rest } = handleProps;

  React.useEffect(() => {
    registerHandle(true);
    return () => registerHandle(false);
  }, [registerHandle]);

  return (
    <button
      type="button"
      data-slot="drag-drop-handle"
      ref={ref as React.Ref<HTMLButtonElement>}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex size-9 shrink-0 cursor-grab items-center justify-center rounded-md",
        "touch-none select-none active:cursor-grabbing",
        "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...rest}
      {...props}
    >
      {children ?? <DragDropHandleIcon />}
    </button>
  );
}

function DragDropHandleIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <circle cx="5" cy="3.5" r="1.25" />
      <circle cx="11" cy="3.5" r="1.25" />
      <circle cx="5" cy="8" r="1.25" />
      <circle cx="11" cy="8" r="1.25" />
      <circle cx="5" cy="12.5" r="1.25" />
      <circle cx="11" cy="12.5" r="1.25" />
    </svg>
  );
}

export type DragDropIndicatorProps = {
  orientation?: DragDropOrientation;
  className?: string;
};

/** Insertion line shown at the active drop target. */
export function DragDropIndicator({
  orientation = "vertical",
  className,
}: DragDropIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="drag-drop-indicator"
      className={cn(
        "bg-primary pointer-events-none absolute z-20 rounded-full",
        orientation === "vertical"
          ? "inset-x-2 -top-1 h-0.5"
          : "inset-y-2 -left-1 w-0.5",
        className,
      )}
    />
  );
}

/** Re-export helpers for advanced consumers. */
export { arrayMove, flattenItems };
export type { UniqueIdentifier };
