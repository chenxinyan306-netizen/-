
export enum AppState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING'
}

export enum TreeState {
  TREE = 'TREE',
  EXPLODE = 'EXPLODE'
}

export interface HandData {
  x: number;
  y: number;
  isPinching: boolean;
  isOpen: boolean;
}

export const COLORS = {
  bg: '#050103',
  pink1: '#FFB7C5',
  pink2: '#FF69B4',
  lavender: '#E6E6FA',
  white: '#FFFFFF',
};
