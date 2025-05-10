import React from 'react';
import '../styles/GameControls.css';

function GameControls({ onNewGame, onUndo, canUndo }) {
  return (
    <div className="game-controls">
      <button className="control-button" onClick={onNewGame}>
        New Game
      </button>
      <button 
        className="control-button" 
        onClick={onUndo} 
        disabled={!canUndo}
      >
        Undo Move
      </button>
    </div>
  );
}

export default GameControls;
