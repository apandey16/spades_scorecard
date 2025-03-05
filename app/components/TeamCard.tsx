import React from 'react';
import { Player, TeamScore } from './types';

interface TeamCardProps {
  teamName: string;
  teamScore: TeamScore;
  players: Player[];
  isEditing: boolean;
  updateTeamName: (newName: string) => void;
  updatePlayerName: (playerIndex: number, newName: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  teamName,
  teamScore,
  players,
  isEditing,
  updateTeamName,
  updatePlayerName
}) => {
  return (
    <div className="card-style p-4">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <input
            type="text"
            value={teamName}
            onChange={(e) => updateTeamName(e.target.value)}
            className="input-field font-semibold text-lg"
            placeholder="Team Name"
            maxLength={25}
          />
        ) : (
          <h2 className="text-lg font-semibold">{teamName}</h2>
        )}
        
        <div className="text-right">
          <div className="text-2xl font-bold">{teamScore.score}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Bags: {teamScore.bags}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {players.map((player, index) => (
          <div key={index} className="flex items-center justify-between">
            {isEditing ? (
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                className="input-field"
                placeholder={`Player ${index + 1}`}
                maxLength={20}
              />
            ) : (
              <span className="font-medium">{player.name}</span>
            )}
            
            {!isEditing && (
              <div className="flex items-center space-x-3">
                {player.bid !== null && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Bid:</span>{' '}
                    <span className="font-medium">
                      {player.bid}
                      {player.blindNil && ' (Blind Nello)'}
                    </span>
                  </div>
                )}
                
                {player.tricks !== null && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tricks:</span>{' '}
                    <span className="font-medium">{player.tricks}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamCard; 