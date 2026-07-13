import { clamp } from '../../utils/clamp';
import type { CollageLayer, CollageTemplateId, EditorAction, EditorState } from '../../types/editor';
import type { EditorPreferences } from '../../types/preferences';

export const MIN_SCALE = 1;
export const MAX_SCALE = 3;
export const MIN_BLUR = 0;
export const MAX_BLUR = 36;
export const DEFAULT_BLUR = 18;
export const SOFT_BLUR = 10;
export const STRONG_BLUR = 28;

function createLayer(sourceIndex: number): CollageLayer {
  const isBase = sourceIndex === 0;
  return {
    id: `photo-${sourceIndex}`,
    sourceIndex,
    x: isBase ? 0.5 : 0.68 - ((sourceIndex - 1) % 3) * 0.08,
    y: isBase ? 0.5 : 0.66 - ((sourceIndex - 1) % 3) * 0.08,
    width: isBase ? 1 : 0.46,
    height: isBase ? 1 : 0.46,
    scale: 1,
    rotation: 0,
    shape: isBase ? 'square' : 'rounded',
    borderRadius: isBase ? 0 : 0.12,
    opacity: 1,
    filter: 'none'
  };
}

export function getTemplateFrames(template: CollageTemplateId, count: number) {
  const gap = 0.018;
  if (template === 'split') {
    return Array.from({ length: count }, (_, index) => ({
      x: (index + 0.5) / count,
      y: 0.5,
      width: 1 / count - gap,
      height: 1 - gap
    }));
  }
  if (template === 'sidebar') {
    return Array.from({ length: count }, (_, index) => index === 0 ? {
      x: 0.34, y: 0.5, width: 0.66 - gap, height: 1 - gap
    } : {
      x: 0.83,
      y: (index - 0.5) / Math.max(1, count - 1),
      width: 0.32 - gap,
      height: 1 / Math.max(1, count - 1) - gap
    });
  }
  if (template === 'feature-grid') {
    if (count === 1) return [{ x: 0.5, y: 0.5, width: 1, height: 1 }];
    return Array.from({ length: count }, (_, index) => index === 0 ? {
      x: 0.5, y: 0.25, width: 1 - gap, height: 0.5 - gap
    } : {
      x: (index - 0.5) / (count - 1),
      y: 0.75,
      width: 1 / (count - 1) - gap,
      height: 0.5 - gap
    });
  }
  return [];
}

function updateSelected(state: EditorState, update: (layer: CollageLayer) => CollageLayer) {
  return {
    ...state,
    layers: state.layers.map((layer) => layer.id === state.selectedLayerId ? update(layer) : layer)
  };
}

export function createInitialEditorState(
  preferences: Partial<EditorPreferences> = {}
): EditorState {
  return {
    backgroundMode: preferences.backgroundMode ?? 'blur',
    backgroundColor: '#171717',
    blurAmount: clamp(preferences.blurAmount ?? DEFAULT_BLUR, MIN_BLUR, MAX_BLUR),
    layers: [],
    selectedLayerId: null,
    templateId: 'free'
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
      return updateSelected(state, (layer) => ({ ...layer, x: 0.5, y: 0.5, scale: 1, rotation: 0 }));
    case 'sync-images': {
      const layers = state.layers.filter((layer) => layer.sourceIndex < action.count);
      for (let index = layers.length; index < action.count; index += 1) layers.push(createLayer(index));
      return { ...state, layers, selectedLayerId: layers[layers.length - 1]?.id ?? null, templateId: state.layers.length ? state.templateId : 'free' };
    }
    case 'select-layer':
      return { ...state, selectedLayerId: action.id };
    case 'apply-template': {
      if (action.value === 'free') return { ...state, templateId: 'free' };
      const frames = getTemplateFrames(action.value, state.layers.length);
      return {
        ...state,
        templateId: action.value,
        layers: state.layers.map((layer, index) => ({ ...layer, ...frames[index], shape: 'square', borderRadius: 0, rotation: 0 }))
      };
    }
    case 'pan':
      return updateSelected(state, (layer) => ({ ...layer, x: clamp(layer.x + action.deltaX, -0.5, 1.5), y: clamp(layer.y + action.deltaY, -0.5, 1.5) }));
    case 'set-scale':
      return updateSelected(state, (layer) => ({ ...layer, scale: clamp(action.value, MIN_SCALE, MAX_SCALE) }));
    case 'set-layer-size':
      return updateSelected(state, (layer) => {
        const width = clamp(action.value, 0.15, 1.4);
        return { ...layer, width, height: layer.shape === 'oval' ? width * 0.65 : width };
      });
    case 'set-layer-rotation':
      return updateSelected(state, (layer) => ({ ...layer, rotation: clamp(action.value, -180, 180) }));
    case 'set-layer-opacity':
      return updateSelected(state, (layer) => ({ ...layer, opacity: clamp(action.value, 0.1, 1) }));
    case 'set-layer-shape':
      return updateSelected(state, (layer) => ({
        ...layer,
        shape: action.value,
        height: action.value === 'oval' ? layer.width * 0.65 : ['circle', 'heart', 'star'].includes(action.value) ? layer.width : layer.height,
        borderRadius: action.value === 'rounded' ? 0.12 : 0
      }));
    case 'set-layer-filter':
      return updateSelected(state, (layer) => ({ ...layer, filter: action.value }));
    case 'bring-layer-forward': {
      const index = state.layers.findIndex((layer) => layer.id === state.selectedLayerId);
      if (index < 0 || index === state.layers.length - 1) return state;
      const layers = [...state.layers];
      [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
      return { ...state, layers };
    }
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
