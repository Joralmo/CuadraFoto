import { describe, expect, it } from 'vitest';
import { createInitialEditorState, editorReducer, getTemplateFrames } from './editor.reducer';

describe('editorReducer collage layers', () => {
  it('creates a base photo and free overlay layers', () => {
    const state = editorReducer(createInitialEditorState(), { type: 'sync-images', count: 3 });
    expect(state.layers).toHaveLength(3);
    expect(state.layers[0]).toMatchObject({ sourceIndex: 0, width: 1, height: 1, shape: 'square' });
    expect(state.layers[2]).toMatchObject({ sourceIndex: 2, shape: 'rounded' });
    expect(state.selectedLayerId).toBe('photo-2');
  });

  it('applies the featured template while preserving photo effects', () => {
    let state = editorReducer(createInitialEditorState(), { type: 'sync-images', count: 3 });
    state = editorReducer(state, { type: 'set-layer-filter', value: 'warm' });
    state = editorReducer(state, { type: 'apply-template', value: 'feature-grid' });
    expect(state.layers[0]).toMatchObject({ x: 0.5, y: 0.25, height: 0.482 });
    expect(state.layers[2].filter).toBe('warm');
  });

  it('edits only the selected layer and clamps values', () => {
    let state = editorReducer(createInitialEditorState(), { type: 'sync-images', count: 2 });
    state = editorReducer(state, { type: 'set-layer-shape', value: 'heart' });
    state = editorReducer(state, { type: 'set-layer-opacity', value: 4 });
    state = editorReducer(state, { type: 'set-layer-rotation', value: -240 });
    expect(state.layers[0].shape).toBe('square');
    expect(state.layers[1]).toMatchObject({ shape: 'heart', opacity: 1, rotation: -180 });
  });

  it('generates non-overflowing split frames for any photo count', () => {
    const frames = getTemplateFrames('split', 4);
    expect(frames).toHaveLength(4);
    expect(frames.every((frame) => frame.width > 0 && frame.x >= 0 && frame.x <= 1)).toBe(true);
  });

  it('keeps an oval aspect ratio when it is resized', () => {
    let state = editorReducer(createInitialEditorState(), { type: 'sync-images', count: 1 });
    state = editorReducer(state, { type: 'set-layer-shape', value: 'oval' });
    state = editorReducer(state, { type: 'set-layer-size', value: 0.6 });
    expect(state.layers[0]).toMatchObject({ width: 0.6, height: 0.39, shape: 'oval' });
  });
});
