import whiteKing from '../assets/w-king.png';
import whiteQueen from '../assets/w-queen.png';
import whiteBishop from '../assets/w-bishop.png';
import whiteKnight from '../assets/w-knight.png';
import whiteRook from '../assets/w-rook.png';
import whitePawn from '../assets/w-pawn.png';
import blackKing from '../assets/b-king.png';
import blackQueen from '../assets/b-queen.png';
import blackBishop from '../assets/b-bishop.png';
import blackKnight from '../assets/b-knight.png';
import blackRook from '../assets/b-rook.png';
import blackPawn from '../assets/b-pawn.png';

const pieceImages = {
    'wK': whiteKing,
    'wQ': whiteQueen,
    'wB': whiteBishop,
    'wN': whiteKnight,
    'wR': whiteRook,
    'wP': whitePawn,
    'bK': blackKing,
    'bQ': blackQueen,
    'bB': blackBishop,
    'bN': blackKnight,
    'bR': blackRook,
    'bP': blackPawn
  };


 export const getPieceImage = (piece) => {
   if (!piece) return null;
   return pieceImages[piece] || null;
 };
 

export const getPieceName = (piece) => {
  if (!piece) return '';
  
  const color = piece[0] === 'w' ? 'White' : 'Black';
  let type = '';
  
  switch(piece[1]) {
    case 'K': type = 'King'; break;
    case 'Q': type = 'Queen'; break;
    case 'R': type = 'Rook'; break;
    case 'B': type = 'Bishop'; break;
    case 'N': type = 'Knight'; break;
    case 'P': type = 'Pawn'; break;
    default: type = '';
  }
  
  return `${color} ${type}`;
};