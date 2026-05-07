import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

import { defaultSettings } from '@/data/defaults';
import type {
  GeometrySettings,
  HSLColour,
  ImageInfo,
  RenderingSettings,
  Settings,
} from '@/lib/types';

export type Action =
  | { type: 'SET_DIMENSIONS'; payload: { width: number; height: number } }
  | { type: 'SET_COLOURS'; payload: HSLColour[] }
  | {
      type: 'SET_GEOMETRY';
      payload: { option: keyof GeometrySettings; value: number };
    }
  | {
      type: 'SET_RENDERING';
      payload: { option: keyof RenderingSettings; value: number };
    }
  | { type: 'SET_IMAGE'; payload: NonNullable<ImageInfo> }
  | { type: 'SET_USE_IMAGE'; payload: boolean }
  | { type: 'NEW_SEED'; payload: number };

function reducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'SET_DIMENSIONS':
      return { ...state, dimensions: action.payload };
    case 'SET_COLOURS':
      return { ...state, colour: action.payload };
    case 'SET_GEOMETRY':
      return {
        ...state,
        geometry: {
          ...state.geometry,
          [action.payload.option]: action.payload.value,
        },
      };
    case 'SET_RENDERING':
      return {
        ...state,
        rendering: {
          ...state.rendering,
          [action.payload.option]: action.payload.value,
        },
      };
    case 'SET_IMAGE':
      return { ...state, image: action.payload, useImage: true };
    case 'SET_USE_IMAGE':
      return { ...state, useImage: action.payload };
    case 'NEW_SEED':
      return { ...state, seed: action.payload };
    default:
      return state;
  }
}

const SettingsContext = createContext<Settings | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultSettings);
  return (
    <SettingsContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function useDispatchSettings(): Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error('useDispatchSettings must be used within SettingsProvider');
  return ctx;
}
