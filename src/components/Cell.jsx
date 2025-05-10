import React from 'react';
import '../styles/Cell.css';

function Cell({ 
  isLightSquare, 
  selected, 
  isValidMove,
  isSpecialMove,
  isEnPassantTarget,
  isKingInCheck, 
  onClick, 
  children 
}) {
  let cellClass = `cell ${isLightSquare ? 'light-square' : 'dark-square'}`;
  
  if (selected) {
    cellClass += ' selected';
  }
  
  if (isKingInCheck) {
    cellClass += ' king-in-check';
  }
  
  if (isValidMove) {
    cellClass += ' valid-move';
  }
  
  if (isSpecialMove) {
    cellClass += ' special-move';
  }
  
  return (
    <div className={cellClass} onClick={onClick}>
      {children}
      {isValidMove && !children && <div className="move-indicator"></div>}
    </div>
  );
}

export default Cell;
