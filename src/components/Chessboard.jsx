import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import Piece from './Piece';
import PromotionDialog from './PromotionDialog';
import { initialBoard } from '../logic/boardSetup';
import { isValidMove, isKingInCheck, wouldMoveExposeCheck } from '../logic/moveValidator';
import GameControls from './GameControls';
import '../styles/Chessboard.css';
import WinnerPopup from './WinnerPopup';

function Chessboard({ onSetupGameHandlers }) {
  const [board, setBoard] = useState(initialBoard);
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('w'); // 'w' for white, 'b' for black
  const [gameOver, setGameOver] = useState(false);
  const [checkStatus, setCheckStatus] = useState({ 
    inCheck: false, 
    player: null
  });
  
  // Add state for promotion
  const [promotion, setPromotion] = useState({
    active: false,
    position: null,
    pawnPosition: null
  });
  
  // Track state for special moves
  const [gameState, setGameState] = useState({
    castlingRights: {
      w: { kingSide: true, queenSide: true },
      b: { kingSide: true, queenSide: true }
    },
    enPassantTarget: null,
    moveHistory: []
  });
  
  // Add this state at the top with other states:
  const [validMoves, setValidMoves] = useState([]);
  
  // Add this state variable with your other state variables
  const [winner, setWinner] = useState(null);
  
  // Check for check and checkmate after a move
  useEffect(() => {
    const inCheck = isKingInCheck(board, currentPlayer);
    setCheckStatus({ 
      inCheck, 
      player: inCheck ? currentPlayer : null 
    });
    
    if (inCheck) {
      // Check if it's checkmate
      let hasValidMove = false;
      
      // Try every possible move for the current player
      for (let startRow = 0; startRow < 8 && !hasValidMove; startRow++) {
        for (let startCol = 0; startCol < 8 && !hasValidMove; startCol++) {
          const piece = board[startRow][startCol];
          if (piece && piece[0] === currentPlayer) {
            // Try every destination for this piece
            for (let endRow = 0; endRow < 8 && !hasValidMove; endRow++) {
              for (let endCol = 0; endCol < 8 && !hasValidMove; endCol++) {
                const moveResult = isValidMove(board, startRow, startCol, endRow, endCol, gameState);
                if (moveResult.valid) {
                  hasValidMove = true;
                  break;
                }
              }
            }
          }
        }
      }
      
      if (!hasValidMove) {
        setGameOver(true);
        // Set the winner (opposite of current player)
        setWinner(currentPlayer === 'w' ? 'b' : 'w');
      }
    }
  }, [board, currentPlayer, gameState]);
  
  useEffect(() => {
    // Expose the game control handlers to parent
    if (onSetupGameHandlers) {
      onSetupGameHandlers({
        onNewGame: handleNewGame,
        onUndo: handleUndo,
        canUndo: gameState.moveHistory.length > 0
      });
    }
  }, [gameState.moveHistory.length]); // Dependency to update canUndo status
  
  const handleCellClick = (row, col) => {
    if (gameOver || promotion.active) return;
    
    // If a cell is already selected
    if (selectedCell) {
      // If clicking the same cell, deselect it
      if (selectedCell.row === row && selectedCell.col === col) {
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }
      
      const piece = board[selectedCell.row][selectedCell.col];
      
      // Only allow moves for the current player's pieces
      if (piece && piece[0] === currentPlayer) {
        // Check if the move is valid
        const moveInfo = isValidMove(
          board, 
          selectedCell.row, 
          selectedCell.col, 
          row, 
          col, 
          gameState
        );
        
        if (moveInfo.valid) {
          // Check for pawn promotion
          if (moveInfo.promotion) {
            setPromotion({
              active: true,
              position: { row, col },
              pawnPosition: { row: selectedCell.row, col: selectedCell.col }
            });
            return;
          }
          
          // Make the move
          makeMove(selectedCell.row, selectedCell.col, row, col, moveInfo);
        } else {
          // If clicking on another piece of the same color, select it instead
          if (board[row][col] && board[row][col][0] === currentPlayer) {
            setSelectedCell({ row, col });
          }
        }
      }
    } 
    // If no cell is selected yet
    else {
      const piece = board[row][col];
      // Only select pieces of the current player
      if (piece && piece[0] === currentPlayer) {
        setSelectedCell({ row, col });
        
        // Calculate valid moves for this piece
        const moves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const moveInfo = isValidMove(board, row, col, r, c, gameState);
            if (moveInfo.valid) {
              moves.push({ row: r, col: c, special: moveInfo.castling || moveInfo.enPassant });
            }
          }
        }
        setValidMoves(moves);
      }
    }
  };
  
  // Function to handle promotion selection
  const handlePromotion = (pieceType) => {
    const { pawnPosition, position } = promotion;
    
    // Create a new board with the promoted piece
    const newBoard = [...board.map(r => [...r])];
    newBoard[position.row][position.col] = `${currentPlayer}${pieceType}`;
    newBoard[pawnPosition.row][pawnPosition.col] = null;
    
    // Update the board and reset promotion state
    setBoard(newBoard);
    setPromotion({ active: false, position: null, pawnPosition: null });
    
    // Update game state
    const newGameState = {
      ...gameState,
      enPassantTarget: null,
      moveHistory: [
        ...gameState.moveHistory,
        {
          piece: `${currentPlayer}P`,
          from: { row: pawnPosition.row, col: pawnPosition.col },
          to: { row: position.row, col: position.col },
          promotion: pieceType
        }
      ]
    };
    
    setGameState(newGameState);
    setSelectedCell(null);
    setValidMoves([]);
    
    // Switch player turn
    setCurrentPlayer(currentPlayer === 'w' ? 'b' : 'w');
  };
  
  // Extract move logic to reuse for regular moves and post-promotion
  const makeMove = (startRow, startCol, endRow, endCol, moveInfo) => {
    // Make a deep copy of the board
    const newBoard = [...board.map(r => [...r])];
    const piece = board[startRow][startCol];
    
    // Special handling for castling
    if (moveInfo.castling) {
      // Move the king
      newBoard[endRow][endCol] = newBoard[startRow][startCol];
      newBoard[startRow][startCol] = null;
      
      // Move the rook
      const { rookStartCol, rookEndCol } = moveInfo.castling;
      newBoard[endRow][rookEndCol] = newBoard[endRow][rookStartCol];
      newBoard[endRow][rookStartCol] = null;
    }
    // Special handling for en passant capture
    else if (moveInfo.enPassant) {
      // Move the pawn
      newBoard[endRow][endCol] = newBoard[startRow][startCol];
      newBoard[startRow][startCol] = null;
      
      // Remove the captured pawn
      newBoard[startRow][endCol] = null;
    }
    // Regular move
    else {
      newBoard[endRow][endCol] = newBoard[startRow][startCol];
      newBoard[startRow][startCol] = null;
    }
    
    // Update game state for special moves
    const newGameState = {
      ...gameState,
      enPassantTarget: null // Reset en passant target by default
    };
    
    // Update castling rights if king or rook moves
    if (piece[1] === 'K') {
      newGameState.castlingRights[currentPlayer].kingSide = false;
      newGameState.castlingRights[currentPlayer].queenSide = false;
    }
    else if (piece[1] === 'R') {
      // Check if it's a rook's starting position
      if (currentPlayer === 'w') {
        if (startRow === 7 && startCol === 0) {
          newGameState.castlingRights.w.queenSide = false;
        } else if (startRow === 7 && startCol === 7) {
          newGameState.castlingRights.w.kingSide = false;
        }
      } else {
        if (startRow === 0 && startCol === 0) {
          newGameState.castlingRights.b.queenSide = false;
        } else if (startRow === 0 && startCol === 7) {
          newGameState.castlingRights.b.kingSide = false;
        }
      }
    }
    
    // Set en passant target if a pawn moves two squares
    if (piece[1] === 'P' && Math.abs(startRow - endRow) === 2) {
      const enPassantRow = (startRow + endRow) / 2; // Middle row
      newGameState.enPassantTarget = { row: enPassantRow, col: endCol };
    }
    
    // Record the move
    newGameState.moveHistory = [
      ...gameState.moveHistory,
      {
        piece,
        from: { row: startRow, col: startCol },
        to: { row: endRow, col: endCol },
        castling: moveInfo.castling,
        enPassant: moveInfo.enPassant
      }
    ];
    
    // Update the board and game state
    setBoard(newBoard);
    setGameState(newGameState);
    setSelectedCell(null);
    setValidMoves([]);
    
    // Switch player turn
    setCurrentPlayer(currentPlayer === 'w' ? 'b' : 'w');
  };
  
  // Function to start a new game
  const handleNewGame = () => {
    setBoard(initialBoard);
    setSelectedCell(null);
    setCurrentPlayer('w');
    setGameOver(false);
    setCheckStatus({ inCheck: false, player: null });
    setPromotion({ active: false, position: null, pawnPosition: null });
    setValidMoves([]);
    setGameState({
      castlingRights: {
        w: { kingSide: true, queenSide: true },
        b: { kingSide: true, queenSide: true }
      },
      enPassantTarget: null,
      moveHistory: []
    });
  };
  
  // Function to undo the last move
  const handleUndo = () => {
    // Need to undo the last move from both players
    if (gameState.moveHistory.length < 1) return;
    
    // Get the previous state (two moves back if possible)
    const movesToUndo = 1;
    const historyIndex = gameState.moveHistory.length - movesToUndo;
    
    // If undoing only one move, just switch back to the previous player
    setCurrentPlayer(currentPlayer === 'w' ? 'b' : 'w');
    
    // Create a copy of the board and revert it to the previous state
    // This is a simplified version - a more complete undo would need to restore the entire game state
    // including castling rights, en passant targets, etc.
    const newBoard = [...initialBoard.map(r => [...r])];
    
    // Replay all moves except the last one
    for (let i = 0; i < historyIndex; i++) {
      const move = gameState.moveHistory[i];
      const { piece, from, to, castling, enPassant, promotion } = move;
      
      // Apply move
      if (promotion) {
        newBoard[to.row][to.col] = `${piece[0]}${promotion}`;
      } else {
        newBoard[to.row][to.col] = piece;
      }
      newBoard[from.row][from.col] = null;
      
      // Special cases
      if (castling) {
        const { rookStartCol, rookEndCol } = castling;
        const rookRow = from.row;
        newBoard[rookRow][rookEndCol] = newBoard[rookRow][rookStartCol];
        newBoard[rookRow][rookStartCol] = null;
      }
      else if (enPassant) {
        newBoard[from.row][to.col] = null; // Remove captured pawn
      }
    }
    
    // Update board and game state
    setBoard(newBoard);
    setSelectedCell(null);
    setValidMoves([]);
    setGameOver(false);
    
    // Update game state (this is simplified - a real undo would restore previous game state)
    const newGameState = {
      ...gameState,
      moveHistory: gameState.moveHistory.slice(0, historyIndex)
    };
    setGameState(newGameState);
  };
  
  // Add a function to handle closing the popup
  const handleClosePopup = () => {
    setWinner(null);
    handleNewGame(); // Reuse your existing newGame function
  };
  
  // Render the chess board
  const renderBoard = () => {
    const cells = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const piece = board[row][col];
        const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
        
        // Highlight king in check
        const isKingInCheck = checkStatus.inCheck && 
                              piece && 
                              piece === `${checkStatus.player}K`;
        
        // Check if this square is an en passant target
        const isEnPassantTarget = gameState.enPassantTarget && 
                                 gameState.enPassantTarget.row === row && 
                                 gameState.enPassantTarget.col === col;
        
        cells.push(
          <Cell
            key={`${row}-${col}`}
            isLightSquare={isLightSquare}
            selected={isSelected}
            isValidMove={validMoves.some(move => move.row === row && move.col === col)}
            isSpecialMove={validMoves.some(move => move.row === row && move.col === col && move.special)}
            isEnPassantTarget={isEnPassantTarget}
            isKingInCheck={isKingInCheck}
            onClick={() => handleCellClick(row, col)}
          >
            {piece && <Piece piece={piece} />}
          </Cell>
        );
      }
    }
    
    return cells;
  };
  
  return (
    <div className="chessboard-container">
      <div className="turn-indicator">
        {currentPlayer === 'w' ? "White's turn" : "Black's turn"}
      </div>
      
      <div className="chessboard">
        {renderBoard()}
        {promotion.active && (
          <PromotionDialog 
            position={promotion.position}
            color={currentPlayer}
            onSelect={handlePromotion}
          />
        )}
      </div>
      
      {/* Add the popup when there's a winner */}
      {winner && (
        <WinnerPopup 
          winner={winner} 
          onClose={handleClosePopup} 
        />
      )}
    </div>
  );
}

export default Chessboard;
