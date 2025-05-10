import React from 'react';
import Piece from './Piece';
import '../styles/PromotionDialog.css';

function PromotionDialog({ position, color, onSelect }) {
  // The pieces that a pawn can be promoted to
  const promotionPieces = ['Q', 'R', 'B', 'N'];
  
  return (
    <div className="promotion-dialog" >
      {promotionPieces.map(pieceType => (
        <div 
          key={pieceType} 
          className="promotion-option"
          onClick={() => onSelect(pieceType)}
        >
          <Piece piece={`${color}${pieceType}`} />
        </div>
      ))}
    </div>
  );
}

export default PromotionDialog;
