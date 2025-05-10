// src/logic/boardSetup.js

// Initial chess board setup with standard starting positions
export const initialBoard = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'], // Black back row
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'], // Black pawns
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'], // White pawns
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']  // White back row
];
