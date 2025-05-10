/**
 * Chess Move Validator
 * Contains functions to validate moves for each piece type
 * according to standard chess rules
 */

// Helper function to check if a position is within the bounds of the board
const isWithinBoard = (row, col) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Helper function to check if a path is clear (no pieces in the way)
const isPathClear = (board, startRow, startCol, endRow, endCol) => {
  // For diagonal moves
  if (Math.abs(endRow - startRow) === Math.abs(endCol - startCol)) {
    const rowStep = endRow > startRow ? 1 : -1;
    const colStep = endCol > startCol ? 1 : -1;
    let row = startRow + rowStep;
    let col = startCol + colStep;
    
    while (row !== endRow && col !== endCol) {
      if (board[row][col] !== null) {
        return false;
      }
      row += rowStep;
      col += colStep;
    }
    return true;
  }
  
  // For horizontal moves
  if (startRow === endRow) {
    const colStep = endCol > startCol ? 1 : -1;
    for (let col = startCol + colStep; col !== endCol; col += colStep) {
      if (board[startRow][col] !== null) {
        return false;
      }
    }
    return true;
  }
  
  // For vertical moves
  if (startCol === endCol) {
    const rowStep = endRow > startRow ? 1 : -1;
    for (let row = startRow + rowStep; row !== endRow; row += rowStep) {
      if (board[row][startCol] !== null) {
        return false;
      }
    }
    return true;
  }
  
  return false;
};

// Validate pawn moves
const validatePawnMove = (board, startRow, startCol, endRow, endCol, gameState) => {
  const piece = board[startRow][startCol];
  const pieceColor = piece[0]; // 'w' or 'b'
  const direction = pieceColor === 'w' ? -1 : 1; // White pawns move up (-1), black pawns move down (+1)
  
  // Target square
  const targetPiece = board[endRow][endCol];
  
  // Check if this move would result in promotion (pawn reaching the last rank)
  const isPromotion = (pieceColor === 'w' && endRow === 0) || (pieceColor === 'b' && endRow === 7);
  
  // Simple move forward (1 square)
  if (endCol === startCol && endRow === startRow + direction && targetPiece === null) {
    return { valid: true, promotion: isPromotion };
  }
  
  // First move can be 2 squares
  if (endCol === startCol && 
      ((pieceColor === 'w' && startRow === 6 && endRow === 4) || 
       (pieceColor === 'b' && startRow === 1 && endRow === 3)) &&
      board[startRow + direction][startCol] === null && // Middle square must be empty
      targetPiece === null) {
    return { valid: true, promotion: false }; // Can't promote on double move
  }
  
  // Normal capture diagonally
  if (Math.abs(endCol - startCol) === 1 && endRow === startRow + direction && 
      targetPiece !== null && targetPiece[0] !== pieceColor) {
    return { valid: true, promotion: isPromotion };
  }
  
  // En passant capture
  if (gameState && gameState.enPassantTarget && 
      gameState.enPassantTarget.row === endRow && 
      gameState.enPassantTarget.col === endCol &&
      Math.abs(endCol - startCol) === 1 && 
      endRow === startRow + direction) {
    return { valid: true, enPassant: true, promotion: false }; // En passant can't lead to promotion
  }
  
  return { valid: false };
};

// Validate rook moves
const validateRookMove = (board, startRow, startCol, endRow, endCol) => {
  // Rooks move in straight lines (horizontally or vertically)
  if (startRow !== endRow && startCol !== endCol) {
    return { valid: false };
  }
  
  return { valid: isPathClear(board, startRow, startCol, endRow, endCol) };
};

// Validate knight moves
const validateKnightMove = (board, startRow, startCol, endRow, endCol) => {
  // Knights move in an L-shape: 2 squares in one direction and 1 square perpendicular
  const rowDiff = Math.abs(endRow - startRow);
  const colDiff = Math.abs(endCol - startCol);
  
  return { valid: ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) };
};

// Validate bishop moves
const validateBishopMove = (board, startRow, startCol, endRow, endCol) => {
  // Bishops move diagonally
  if (Math.abs(endRow - startRow) !== Math.abs(endCol - startCol)) {
    return { valid: false };
  }
  
  return { valid: isPathClear(board, startRow, startCol, endRow, endCol) };
};

// Validate queen moves
const validateQueenMove = (board, startRow, startCol, endRow, endCol) => {
  // Queens can move like rooks or bishops
  if (startRow === endRow || startCol === endCol) {
    return validateRookMove(board, startRow, startCol, endRow, endCol);
  }
  
  if (Math.abs(endRow - startRow) === Math.abs(endCol - startCol)) {
    return validateBishopMove(board, startRow, startCol, endRow, endCol);
  }
  
  return { valid: false };
};

// Check if a square is under attack by any opponent piece
const isSquareUnderAttack = (board, row, col, attackerColor) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece[0] === attackerColor) {
        // For all pieces except pawns, we can use our regular validation
        if (piece[1] !== 'P') {
          // Temporarily set the piece destination to null to avoid false detection
          // (e.g., when checking if a piece is pinned)
          const originalPiece = board[row][col];
          board[row][col] = null;
          
          const moveResult = isValidMove(board, r, c, row, col);
          
          // Restore the original piece
          board[row][col] = originalPiece;
          
          if (moveResult.valid) {
            return true;
          }
        } 
        // Special handling for pawns, as they capture differently than they move
        else if (piece[1] === 'P') {
          const pawnDirection = piece[0] === 'w' ? -1 : 1;
          // Pawns attack diagonally
          if ((r + pawnDirection === row) && (Math.abs(c - col) === 1)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

// Validate king moves
const validateKingMove = (board, startRow, startCol, endRow, endCol, gameState) => {
  const piece = board[startRow][startCol];
  const pieceColor = piece[0]; // 'w' or 'b'
  const opponentColor = pieceColor === 'w' ? 'b' : 'w';
  
  // Regular king move - one square in any direction
  const rowDiff = Math.abs(endRow - startRow);
  const colDiff = Math.abs(endCol - startCol);
  
  if (rowDiff <= 1 && colDiff <= 1) {
    return { valid: true };
  }
  
  // Castling
  if (gameState && rowDiff === 0 && colDiff === 2) {
    // King must not have moved yet
    const castlingRights = gameState.castlingRights[pieceColor];
    
    // King cannot castle out of check
    if (isKingInCheck(board, pieceColor)) {
      return { valid: false, reason: 'king in check' };
    }
    
    // Kingside castling (right)
    if (endCol === 6 && castlingRights.kingSide) {
      // Check if path is clear
      if (isPathClear(board, startRow, startCol, startRow, 7) && 
          // Ensure the rook is in place
          board[startRow][7] === `${pieceColor}R`) {
        
        // Check if the square the king moves through is under attack
        if (isSquareUnderAttack(board, startRow, 5, opponentColor)) {
          return { valid: false, reason: 'castling through check' };
        }
        
        return { 
          valid: true, 
          castling: { rookStartCol: 7, rookEndCol: 5 }
        };
      }
    }
    // Queenside castling (left)
    else if (endCol === 2 && castlingRights.queenSide) {
      // Check if path is clear
      if (isPathClear(board, startRow, startCol, startRow, 0) && 
          // Ensure the rook is in place
          board[startRow][0] === `${pieceColor}R`) {
        
        // Check if the square the king moves through is under attack
        if (isSquareUnderAttack(board, startRow, 3, opponentColor)) {
          return { valid: false, reason: 'castling through check' };
        }
        
        return { 
          valid: true, 
          castling: { rookStartCol: 0, rookEndCol: 3 }
        };
      }
    }
  }
  
  return { valid: false };
};

// Determine if a king is in check
export const isKingInCheck = (board, kingColor) => {
  // First, find the king's position
  let kingRow = -1;
  let kingCol = -1;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece === `${kingColor}K`) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== -1) break;
  }
  
  if (kingRow === -1) return false; // King not found (shouldn't happen in a valid game)
  
  // Check if any opponent piece can attack the king
  const opponentColor = kingColor === 'w' ? 'b' : 'w';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === opponentColor) {
        // Check if this piece can attack the king
        const moveResult = isValidMove(board, row, col, kingRow, kingCol);
        if (moveResult.valid) {
          return true; // King is in check
        }
      }
    }
  }
  
  return false; // King is not in check
};

// Check if a move would leave the player's own king in check
export const wouldMoveExposeCheck = (board, startRow, startCol, endRow, endCol, playerColor) => {
  // Create a copy of the board with the move applied
  const testBoard = [...board.map(row => [...row])];
  testBoard[endRow][endCol] = testBoard[startRow][startCol];
  testBoard[startRow][startCol] = null;
  
  // Check if the player's king would be in check after this move
  return isKingInCheck(testBoard, playerColor);
};

// Main validation function
export const isValidMove = (board, startRow, startCol, endRow, endCol, gameState = null) => {
  // Check if positions are within the board
  if (!isWithinBoard(startRow, startCol) || !isWithinBoard(endRow, endCol)) {
    return { valid: false };
  }
  
  // Get the piece to move
  const piece = board[startRow][startCol];
  if (!piece) {
    return { valid: false };
  }
  
  const playerColor = piece[0];
  
  // Check if the target square has our own piece
  const targetPiece = board[endRow][endCol];
  if (targetPiece && targetPiece[0] === playerColor) {
    return { valid: false };
  }
  
  // Delegate to the appropriate piece validator
  const pieceType = piece[1];
  let moveResult;
  
  switch (pieceType) {
    case 'P':
      moveResult = validatePawnMove(board, startRow, startCol, endRow, endCol, gameState);
      break;
    case 'R':
      moveResult = validateRookMove(board, startRow, startCol, endRow, endCol);
      break;
    case 'N':
      moveResult = validateKnightMove(board, startRow, startCol, endRow, endCol);
      break;
    case 'B':
      moveResult = validateBishopMove(board, startRow, startCol, endRow, endCol);
      break;
    case 'Q':
      moveResult = validateQueenMove(board, startRow, startCol, endRow, endCol);
      break;
    case 'K':
      moveResult = validateKingMove(board, startRow, startCol, endRow, endCol, gameState);
      break;
    default:
      moveResult = { valid: false };
  }
  
  // If the move is valid according to piece rules, check that it doesn't leave the king in check
  if (moveResult.valid) {
    if (wouldMoveExposeCheck(board, startRow, startCol, endRow, endCol, playerColor)) {
      return { valid: false, reason: 'would leave king in check' };
    }
  }
  
  return moveResult;
};
