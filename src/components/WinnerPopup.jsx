import React from 'react';
import '../styles/WinnerPopup.css';

function WinnerPopup({ winner, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="winner-popup">
        <h2>Checkmate!</h2>
        <p>{winner === 'w' ? 'White' : 'Black'} won!</p>
        <button className="popup-button" onClick={onClose}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export default WinnerPopup;
