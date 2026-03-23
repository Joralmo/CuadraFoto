import { clamp } from '../../utils/clamp';
import type { EditorAction, EditorState } from '../../types/editor';
import type { EditorPreferences } from '../../types/preferences';

export const MIN_SCALE = 1;
export const MAX_SCALE = 3;
export const MIN_BLUR = 0;
export const MAX_BLUR = 36;
export const DEFAULT_BLUR = 18;
export const SOFT_BLUR = 10;
export const STRONG_BLUR = 28;

export function createInitialEditorState(
  preferences: Partial<EditorPreferences> = {}
): EditorState {
  return {
    backgroundMode: preferences.backgroundMode ?? 'blur',
    backgroundColor: '#171717',
    blurAmount: clamp(preferences.blurAmount ?? DEFAULT_BLUR, MIN_BLUR, MAX_BLUR),
    scale: 1,
    offsetX: 0,
    offsetY: 0
  };
}

export function editorReducer(
  state: EditorState,
  action: EditorAction
): EditorState {
  switch (action.type) {
    case 'reset-all':
      return createInitialEditorState(action.preferences);
    case 'reset-transform':
      return {
        ...state,
        offsetX: 0,
        offsetY: 0,
        scale: 1
      };
    case 'pan':
      return {
        ...state,
        offsetX: state.offsetX + action.deltaX,
        offsetY: state.offsetY + action.deltaY
      };
    case 'set-scale':
      return {
        ...state,
        scale: clamp(action.value, MIN_SCALE, MAX_SCALE)
      };
    case 'set-background-mode':
      return {
        ...state,
        backgroundMode: action.value
      };
    case 'set-background-color':
      return {
        ...state,
        backgroundColor: action.value
      };
    case 'set-blur-amount':
      return {
        ...state,
        blurAmount: clamp(action.value, MIN_BLUR, MAX_BLUR)
      };
    default:
      return state;
  }
}
