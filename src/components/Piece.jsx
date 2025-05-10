import React from 'react';
import { getPieceImage, getPieceName } from '../logic/pieceHelper';
import '../styles/Piece.css';

function Piece({ piece }) {
  const pieceImage = getPieceImage(piece);
  
  if (!pieceImage) return null;
  
  return (
    <img 
      src={pieceImage} 
      alt={getPieceName(piece)}
      className="chess-piece"
      draggable={false}
    />
  );
}

export default Piece;
