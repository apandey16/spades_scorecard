import React from 'react';
import { Round, Player } from './types';

interface GameHistoryProps {
  history: Round[];
  team1Name: string;
  team2Name: string;
}

const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  team1Name,
  team2Name
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="card-style p-4 mt-6">
      <h3 className="text-lg font-semibold mb-3">Game History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="text-left px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Round</th>
              <th className="text-left px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Players</th>
              <th className="text-right px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bid</th>
              <th className="text-right px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tricks</th>
              <th className="text-right px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((round, roundIndex) => (
              <React.Fragment key={roundIndex}>
                {/* Team 1 Row */}
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-2 py-2 align-top" rowSpan={2}>
                    <span className="font-medium">{roundIndex + 1}</span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="font-medium text-sm">{team1Name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {displayPlayerNames(round.team1Player1, round.team1Player2)}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right">
                    {displayBids(round.team1Player1, round.team1Player2)}
                  </td>
                  <td className="px-2 py-2 text-right">{round.team1Tricks}</td>
                  <td className="px-2 py-2 text-right font-medium">
                    {round.team1Points > 0 ? `+${round.team1Points}` : round.team1Points}
                  </td>
                </tr>
                
                {/* Team 2 Row */}
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-2 py-2">
                    <div className="font-medium text-sm">{team2Name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {displayPlayerNames(round.team2Player1, round.team2Player2)}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right">
                    {displayBids(round.team2Player1, round.team2Player2)}
                  </td>
                  <td className="px-2 py-2 text-right">{round.team2Tricks}</td>
                  <td className="px-2 py-2 text-right font-medium">
                    {round.team2Points > 0 ? `+${round.team2Points}` : round.team2Points}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to display player names
const displayPlayerNames = (player1: Player, player2: Player): string => {
  return `${player1.name}, ${player2.name}`;
};

// Helper function to format bids display
const displayBids = (player1: Player, player2: Player): string => {
  const bid1 = player1.blindNil ? 'B0' : player1.bid;
  const bid2 = player2.blindNil ? 'B0' : player2.bid;
  return `${bid1} + ${bid2}`;
};

export default GameHistory; 