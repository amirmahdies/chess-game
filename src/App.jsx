import React, { useState } from 'react';
import Chessboard from './components/Chessboard';
import './App.css';

function App() {
  // State to store game control handlers
  const [gameHandlers, setGameHandlers] = useState(null);
  // State to track if the game has started
  const [gameStarted, setGameStarted] = useState(false);

  // Function to receive handlers from Chessboard
  const setupGameHandlers = (handlers) => {
    setGameHandlers(handlers);
  };

  // Function to handle starting the game
  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <div className="start-screen">
          <div className="chess-title-container">
            <h1 className="chess-title" data-text="Chess">Chess</h1>
            <h1 className="chess-title" data-text="Game">Game</h1>
          </div>
          <button className="start-button" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="left-section">
            <div className="chess-title-container">
              <h1 className="chess-title" data-text="Chess">Chess</h1>
              <h1 className="chess-title" data-text="Game">Game</h1>
            </div>
            {gameHandlers && (
              <div className="left-controls">
                <button className="control-button" onClick={gameHandlers.onNewGame}>
                  New Game
                </button>
                <button 
                  className="control-button" 
                  onClick={gameHandlers.onUndo} 
                  disabled={!gameHandlers.canUndo}
                >
                  Undo Move
                </button>
              </div>
            )}
          </div>
          <div className="chessboard-container">
            <Chessboard onSetupGameHandlers={setupGameHandlers} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;