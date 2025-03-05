import React from 'react';
import { Player } from './types';

interface PlayerInputProps {
  playerIndex: number;
  player: Player;
  roundNumber: number;
  showTricks: boolean;
  maxBid: number;
  updateBid: (playerIndex: number, bid: number) => void;
  updateBlindNil: (playerIndex: number, isBlindNil: boolean) => void;
  updateTricks: (playerIndex: number, tricks: number) => void;
}

const PlayerInput: React.FC<PlayerInputProps> = ({
  playerIndex,
  player,
  roundNumber,
  showTricks,
  maxBid,
  updateBid,
  updateBlindNil,
  updateTricks
}) => {
  // Generate array of possible bids (0 to maxBid)
  const possibleBids = Array.from({ length: maxBid + 1 }, (_, i) => i);

  // Determine if blind nil is allowed (usually in the first 1-2 rounds only)
  const blindNilAllowed = roundNumber <= 2;

  return (
    <div className="flex flex-col mb-6">
      <div className="flex items-center mb-2">
        <span className="font-medium w-24">{player.name}</span>
        
        {/* Bid Input Section */}
        {!showTricks && (
          <div className="flex items-center">
            <select
              value={player.bid}
              onChange={(e) => updateBid(playerIndex, parseInt(e.target.value))}
              className="input-select mr-3"
              aria-label={`${player.name}'s bid`}
            >
              {possibleBids.map((bid) => (
                <option key={bid} value={bid}>
                  {bid}
                </option>
              ))}
            </select>
            
            {player.bid === 0 && blindNilAllowed && (
              <div className="flex items-center text-sm">
                <input
                  type="checkbox"
                  id={`blind-nil-${playerIndex}`}
                  checked={player.blindNil}
                  onChange={(e) => updateBlindNil(playerIndex, e.target.checked)}
                  className="mr-1"
                />
                <label htmlFor={`blind-nil-${playerIndex}`}>Blind Nello</label>
              </div>
            )}
          </div>
        )}
        
        {/* Tricks Input Section */}
        {showTricks && (
          <div className="flex items-center">
            <select
              value={player.tricks}
              onChange={(e) => updateTricks(playerIndex, parseInt(e.target.value))}
              className="input-select"
              aria-label={`${player.name}'s tricks`}
            >
              {Array.from({ length: maxBid + 1 }, (_, i) => i).map((tricks) => (
                <option key={tricks} value={tricks}>
                  {tricks}
                </option>
              ))}
            </select>
            
            {/* Show bid for reference */}
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              Bid: {player.bid} {player.blindNil && "(Blind Nello)"}
            </span>
          </div>
        )}
      </div>
      
      {/* Show validation error if tricks input is visible but no value set */}
      {showTricks && player.tricks === null && (
        <p className="text-red-500 text-sm">Please enter tricks taken</p>
      )}
    </div>
  );
};

export default PlayerInput;
