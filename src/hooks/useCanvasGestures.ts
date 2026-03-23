import { useRef } from 'react';

type PointerPoint = {
  x: number;
  y: number;
};

type GestureState = {
  isPinching: boolean;
  lastPanPoint: PointerPoint | null;
  pinchStartDistance: number | null;
  pinchStartScale: number | null;
  pointers: Map<number, PointerPoint>;
};

type CanvasGestureHandlers = {
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
};

type UseCanvasGesturesOptions = {
  getScale: () => number;
  onPan: (deltaX: number, deltaY: number) => void;
  onScaleChange: (value: number) => void;
};

function getDistance(first: PointerPoint, second: PointerPoint) {
  const deltaX = second.x - first.x;
  const deltaY = second.y - first.y;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function getFirstTwoPointers(points: Map<number, PointerPoint>) {
  const iterator = points.values();
  const first = iterator.next().value as PointerPoint | undefined;
  const second = iterator.next().value as PointerPoint | undefined;

  return { first, second };
}

function releasePointer(
  event: React.PointerEvent<HTMLElement>,
  state: GestureState
) {
  state.pointers.delete(event.pointerId);

  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (state.pointers.size < 2) {
    state.isPinching = false;
    state.pinchStartDistance = null;
    state.pinchStartScale = null;
  }

  const remainingPointer = state.pointers.values().next().value as
    | PointerPoint
    | undefined;

  state.lastPanPoint = remainingPointer
    ? { x: remainingPointer.x, y: remainingPointer.y }
    : null;
}

export function useCanvasGestures({
  getScale,
  onPan,
  onScaleChange
}: UseCanvasGesturesOptions): CanvasGestureHandlers {
  const stateRef = useRef<GestureState>({
    isPinching: false,
    lastPanPoint: null,
    pinchStartDistance: null,
    pinchStartScale: null,
    pointers: new Map()
  });

  return {
    onPointerDown: (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      const state = stateRef.current;
      const point = {
        x: event.clientX,
        y: event.clientY
      };

      state.pointers.set(event.pointerId, point);
      event.currentTarget.setPointerCapture(event.pointerId);

      if (state.pointers.size === 1) {
        state.lastPanPoint = point;
        return;
      }

      if (state.pointers.size >= 2) {
        const { first, second } = getFirstTwoPointers(state.pointers);

        if (!first || !second) {
          return;
        }

        state.isPinching = true;
        state.pinchStartDistance = getDistance(first, second);
        state.pinchStartScale = getScale();
        state.lastPanPoint = null;
      }
    },
    onPointerMove: (event) => {
      const state = stateRef.current;
      const existingPointer = state.pointers.get(event.pointerId);

      if (!existingPointer) {
        return;
      }

      const nextPoint = {
        x: event.clientX,
        y: event.clientY
      };

      state.pointers.set(event.pointerId, nextPoint);

      if (state.pointers.size >= 2) {
        const { first, second } = getFirstTwoPointers(state.pointers);

        if (!first || !second || !state.pinchStartDistance || !state.pinchStartScale) {
          return;
        }

        const nextDistance = getDistance(first, second);

        if (nextDistance <= 0) {
          return;
        }

        const nextScale =
          state.pinchStartScale * (nextDistance / state.pinchStartDistance);

        onScaleChange(nextScale);
        return;
      }

      if (!state.lastPanPoint) {
        state.lastPanPoint = nextPoint;
        return;
      }

      const deltaX = nextPoint.x - state.lastPanPoint.x;
      const deltaY = nextPoint.y - state.lastPanPoint.y;

      state.lastPanPoint = nextPoint;

      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      onPan(deltaX, deltaY);
    },
    onPointerUp: (event) => {
      releasePointer(event, stateRef.current);
    },
    onPointerCancel: (event) => {
      releasePointer(event, stateRef.current);
    }
  };
}

