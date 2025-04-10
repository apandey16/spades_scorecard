'use client';

import { useState, useEffect } from 'react';

interface TeamScore {
  score: number;
  bags: number;
  name: string;
  player1Name: string;
  player2Name: string;
  penalizedYellowCards: number;  // Track how many yellow cards have already been penalized
}

interface Player {
  bid: number;
  isNello: boolean;
  isBlindNello: boolean;
  nelloSuccess?: boolean;
}

interface Round {
  team1Player1: Player;
  team1Player2: Player;
  team2Player1: Player;
  team2Player2: Player;
  team1Tricks: number;
  team2Tricks: number;
  team1Bags: number;
  team2Bags: number;
  team1YellowCards: number;
  team2YellowCards: number;
  biddingComplete: boolean;
  tricksComplete: boolean;
  yellowCardsComplete: boolean;
}

const initialPlayerState: Player = {
  bid: 0,
  isNello: false,
  isBlindNello: false,
};

const initialRoundState: Round = {
  team1Player1: { ...initialPlayerState },
  team1Player2: { ...initialPlayerState },
  team2Player1: { ...initialPlayerState },
  team2Player2: { ...initialPlayerState },
  team1Tricks: 0,
  team2Tricks: 0,
  team1Bags: 0,
  team2Bags: 0,
  team1YellowCards: 0,
  team2YellowCards: 0,
  biddingComplete: false,
  tricksComplete: false,
  yellowCardsComplete: false,
};

const getGameRules = (isShortGame: boolean, isTournamentRules: boolean, isFinalsGame: boolean) => {
  const baseRules = `General Rules: 
- The spade suit is always trump.
- A (high), K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2.
- There are 4 people per game and it is played in teams of 2.

The Deal:
The first dealer is chosen by a draw for high card, and thereafter the turn to deal proceeds clockwise. The entire deck is dealt one at a time, face down, beginning on the dealer's left. The players then pick up their cards and arrange them by suits and rank.

The Bidding:
Each player decides how many tricks (or hands) they will be able to win and the total number of tricks that need to be won by the team is the sum of what each player bid. The player to the dealer's left starts the bidding and, in turn, each player states how many tricks they expect to win. Any player can call 'nello' which implies that they are bidding 0 wins.

The Play:
The player on the dealer's left makes the opening lead, and players must follow suit, if possible. If a player cannot follow suit, they may play a trump or discard. The trick is won by the player who plays the highest trump or if no trump was played, the player who played the highest card in the suit led. The player who wins the trick leads next. Play continues until none of the players have any cards left. Each hand is worth 13 tricks. Spades cannot be led unless played previously or player to lead has nothing but Spades in their hand.`;

  if (isTournamentRules) {
    if (isFinalsGame) {
      return `${baseRules}

Object of the Game:
To reach 500 points in tournament finals.

How to Keep Score:
The game is scored as a team. If one person on the team bids 3 tricks and the other bids 4 tricks, the team as a whole needs to win seven tricks to make the contract.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 100 points is made every time a team accumulates 10 bags throughout the game. Thus, the object is always to fulfill the bid exactly.

When a team is behind by 250 points or more, their players have the option to call a 'blind nello'. A blind nello is worth 200 points if successful (no tricks won) but also loses 200 points if failed (any tricks won). This provides a strategic comeback mechanism for teams that are significantly behind.

Tournament Finals Special Rules:
- Games go to 500 points
- Every 10 bags result in a -100 point penalty
- Total bags are tracked for tiebreakers (each bag = 1 point)
- Blind nellos are allowed when a team is 250+ points behind

For example, if the team's bid is Seven and they make seven tricks, the score would be 70. If the bid was Five and the team won eight tricks, the score would be 50 points: 50 points for the bid, and 3 bags for the three overtricks.

If the team "breaks contract," that is, if they take fewer than the number of tricks bid, they lose the amount that was bid. For example, if a player bids Four and wins only three tricks, -40 points are awarded.`;
    } else {
      return `${baseRules}

Object of the Game:
To reach 250 points or complete 8 rounds in tournament play.

How to Keep Score:
The game is scored as a team. If one person on the team bids 3 tricks and the other bids 4 tricks, the team as a whole needs to win seven tricks to make the contract.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 50 points is made every time a team accumulates 5 bags throughout the game. Thus, the object is always to fulfill the bid exactly.

Tournament Regular Game Special Rules:
- Games end at 250 points or after 8 rounds
- Every 5 bags result in a -50 point penalty
- Total bags are tracked for tiebreakers (each bag = 1 point)
- Blind nellos are not allowed in regular tournament games

For example, if the team's bid is Seven and they make seven tricks, the score would be 70. If the bid was Five and the team won eight tricks, the score would be 50 points: 50 points for the bid, and 3 bags for the three overtricks.

If the team "breaks contract," that is, if they take fewer than the number of tricks bid, they lose the amount that was bid. For example, if a player bids Four and wins only three tricks, -40 points are awarded.`;
    }
  } else if (isShortGame) {
    return `${baseRules}

Object of the Game:
To reach 250 points in a short game.

How to Keep Score:
The game is scored as a team. If one person on the team bids 3 tricks and the other bids 4 tricks, the team as a whole needs to win seven tricks to make the contract.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 50 points is made every time a team accumulates 5 bags throughout the game. Thus, the object is always to fulfill the bid exactly.

When a team is behind by 250 points or more, their players have the option to call a 'blind nello'. A blind nello is worth 200 points if successful (no tricks won) but also loses 200 points if failed (any tricks won). This provides a strategic comeback mechanism for teams that are significantly behind.

Short Game Special Rules:
- Games go to 250 points
- Every 5 bags result in a -50 point penalty

For example, if the team's bid is Seven and they make seven tricks, the score would be 70. If the bid was Five and the team won eight tricks, the score would be 50 points: 50 points for the bid, and 3 bags for the three overtricks.

If the team "breaks contract," that is, if they take fewer than the number of tricks bid, they lose the amount that was bid. For example, if a player bids Four and wins only three tricks, -40 points are awarded.`;
  } else {
    return `${baseRules}

Object of the Game:
To reach 500 points in a regular game.

How to Keep Score:
The game is scored as a team. If one person on the team bids 3 tricks and the other bids 4 tricks, the team as a whole needs to win seven tricks to make the contract.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 100 points is made every time a team accumulates 10 bags throughout the game. Thus, the object is always to fulfill the bid exactly.

When a team is behind by 250 points or more, their players have the option to call a 'blind nello'. A blind nello is worth 200 points if successful (no tricks won) but also loses 200 points if failed (any tricks won). This provides a strategic comeback mechanism for teams that are significantly behind.

Regular Game Special Rules:
- Games go to 500 points
- Every 10 bags result in a -100 point penalty

For example, if the team's bid is Seven and they make seven tricks, the score would be 70. If the bid was Five and the team won eight tricks, the score would be 50 points: 50 points for the bid, and 3 bags for the three overtricks.

If the team "breaks contract," that is, if they take fewer than the number of tricks bid, they lose the amount that was bid. For example, if a player bids Four and wins only three tricks, -40 points are awarded.`;
  }
};

// Add this type before the component
type HistoryEditField = 
  | keyof Round 
  | 'team1_1_bid' | 'team1_1_isNello' | 'team1_1_nelloSuccess'
  | 'team1_2_bid' | 'team1_2_isNello' | 'team1_2_nelloSuccess'
  | 'team2_1_bid' | 'team2_1_isNello' | 'team2_1_nelloSuccess'
  | 'team2_2_bid' | 'team2_2_isNello' | 'team2_2_nelloSuccess';

export default function SpadesGame() {
  const [team1Score, setTeam1Score] = useState<TeamScore>({ 
    score: 0, 
    bags: 0, 
    name: "Team 1",
    player1Name: "Player 1",
    player2Name: "Player 2",
    penalizedYellowCards: 0
  });
  
  const [team2Score, setTeam2Score] = useState<TeamScore>({ 
    score: 0, 
    bags: 0,
    name: "Team 2",
    player1Name: "Player 1",
    player2Name: "Player 2",
    penalizedYellowCards: 0
  });
  
  const [currentRound, setCurrentRound] = useState<Round>(initialRoundState);
  const [history, setHistory] = useState<Round[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isShortGame, setIsShortGame] = useState(false);
  const [isTournamentRules, setIsTournamentRules] = useState(false);
  const [isFinalsGame, setIsFinalsGame] = useState(false);
  const [isDoubleNilAllowed, setIsDoubleNilAllowed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [totalBagsTeam1, setTotalBagsTeam1] = useState(0);
  const [totalBagsTeam2, setTotalBagsTeam2] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);

  // Handle hydration and localStorage in a single useEffect
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedTeam1Score = localStorage.getItem('team1Score');
        const savedTeam2Score = localStorage.getItem('team2Score');
        const savedCurrentRound = localStorage.getItem('currentRound');
        const savedHistory = localStorage.getItem('history');
        const savedIsEditing = localStorage.getItem('isEditing');
        const savedIsShortGame = localStorage.getItem('isShortGame');
        const savedIsTournamentRules = localStorage.getItem('isTournamentRules');
        const savedIsFinalsGame = localStorage.getItem('isFinalsGame');
        
        if (savedTeam1Score) {
          const parsedTeam1Score = JSON.parse(savedTeam1Score);
          // Ensure the penalizedYellowCards property exists
          if (parsedTeam1Score.penalizedYellowCards === undefined) {
            parsedTeam1Score.penalizedYellowCards = 0;
          }
          setTeam1Score(parsedTeam1Score);
        }
        
        if (savedTeam2Score) {
          const parsedTeam2Score = JSON.parse(savedTeam2Score);
          // Ensure the penalizedYellowCards property exists
          if (parsedTeam2Score.penalizedYellowCards === undefined) {
            parsedTeam2Score.penalizedYellowCards = 0;
          }
          setTeam2Score(parsedTeam2Score);
        }
        
        if (savedCurrentRound) setCurrentRound(JSON.parse(savedCurrentRound));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedIsEditing) setIsEditing(JSON.parse(savedIsEditing));
        if (savedIsShortGame) setIsShortGame(JSON.parse(savedIsShortGame));
        if (savedIsTournamentRules) setIsTournamentRules(JSON.parse(savedIsTournamentRules));
        if (savedIsFinalsGame) setIsFinalsGame(JSON.parse(savedIsFinalsGame));
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
      setIsHydrated(true);
    };

    loadFromLocalStorage();
  }, []);

  // Save to localStorage only after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      localStorage.setItem('team1Score', JSON.stringify(team1Score));
      localStorage.setItem('team2Score', JSON.stringify(team2Score));
      localStorage.setItem('currentRound', JSON.stringify(currentRound));
      localStorage.setItem('history', JSON.stringify(history));
      localStorage.setItem('isEditing', JSON.stringify(isEditing));
      localStorage.setItem('isShortGame', JSON.stringify(isShortGame));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [team1Score, team2Score, currentRound, history, isEditing, isShortGame, isHydrated]);

  // Don't render until after hydration
  if (!isHydrated) {
    return null;
  }

  const calculateTeamScore = (
    players: Player[], 
    tricks: number, 
    currentScore: TeamScore,
    yellowCards: number,
    isFinalCalculation: boolean = false  // Flag to indicate if this is the final calculation for the round
  ) => {
    let newScore = { ...currentScore };
    let totalBid = 0;
    let totalBags = 0;

    players.forEach(player => {
      if (player.isNello) {
        if (player.nelloSuccess) {
          newScore.score += player.isBlindNello ? 200 : 100;
        } else {
          newScore.score -= player.isBlindNello ? 200 : 100;
        }
      } else {
        totalBid += player.bid;
      }
    });

    if (tricks >= totalBid) {
      newScore.score += totalBid * 10;
      totalBags = tricks - totalBid;
    } else {
      newScore.score -= totalBid * 10;
    }

    newScore.bags += totalBags;
    
    // Apply yellow card penalties based on current round or total accumulated
    if (isFinalCalculation) {
      // For final round calculation:
      // 1. Calculate total yellow cards including this round
      let totalYellowCards = yellowCards;
      if (players[0] === currentRound.team1Player1 || players[1] === currentRound.team1Player2) {
        // Team 1
        totalYellowCards = history.reduce((sum, round) => sum + (round.team1YellowCards || 0), 0) + yellowCards;
      } else {
        // Team 2
        totalYellowCards = history.reduce((sum, round) => sum + (round.team2YellowCards || 0), 0) + yellowCards;
      }
      
      // 2. Calculate how many new penalties to apply
      const totalPenaltiesEarned = Math.floor(totalYellowCards / 2);
      const previouslyPenalized = Math.floor(newScore.penalizedYellowCards / 2);
      const newPenalties = totalPenaltiesEarned - previouslyPenalized;
      
      // 3. Only apply new penalties
      if (newPenalties > 0) {
        newScore.score -= newPenalties * 50;
      }
      
      // 4. Update the penalized yellow cards count
      newScore.penalizedYellowCards = totalYellowCards;
    } else {
      // For preview calculation, calculate what the penalty would be
      // based on total accumulated yellow cards
      let totalYellowCards = yellowCards;
      if (players[0] === currentRound.team1Player1 || players[1] === currentRound.team1Player2) {
        // Team 1
        totalYellowCards = history.reduce((sum, round) => sum + (round.team1YellowCards || 0), 0) + yellowCards;
      } else {
        // Team 2
        totalYellowCards = history.reduce((sum, round) => sum + (round.team2YellowCards || 0), 0) + yellowCards;
      }
      
      const totalPenaltiesEarned = Math.floor(totalYellowCards / 2);
      const previouslyPenalized = Math.floor(newScore.penalizedYellowCards / 2);
      const newPenalties = totalPenaltiesEarned - previouslyPenalized;
      
      if (newPenalties > 0) {
        newScore.score -= newPenalties * 50;
      }
    }
    
    // Check for bag penalty based on game type
    if (isTournamentRules) {
      if (isFinalsGame) {
        while (newScore.bags >= 10) {
          newScore.score -= 100;
          newScore.bags -= 10;
        }
      } else {
        while (newScore.bags >= 5) {
          newScore.score -= 50;
          newScore.bags -= 5;
        }
      }
    } else if (isShortGame) {
      while (newScore.bags >= 5) {
        newScore.score -= 50;
        newScore.bags -= 5;
      }
    } else {
      while (newScore.bags >= 10) {
        newScore.score -= 100;
        newScore.bags -= 10;
      }
    }
    
    return newScore;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, team: 1 | 2, player: 1 | 2, field: keyof Player) => {
    const playerKey = `team${team}Player${player}` as keyof Round;
    let value: number | boolean;
    
    if (field === 'isNello' || field === 'isBlindNello') {
      // Prevent blind nellos in tournament mode regular games
      if (field === 'isBlindNello' && isTournamentRules && !isFinalsGame) {
        alert("Blind Nellos are not allowed in tournament regular games!");
        return;
      }
      value = e.target.checked;
    } else {
      // For bid field: handle empty input and invalid numbers
      const inputValue = e.target.value;
      if (inputValue === '' || isNaN(parseInt(inputValue))) {
        value = 0;
      } else {
        value = Math.max(0, parseInt(inputValue));
      }
    }
    
    setCurrentRound(prev => ({
      ...prev,
      [playerKey]: {
        ...(prev[playerKey] as Player),
        [field]: value,
        ...(field === 'isNello' && value ? { bid: 0, isBlindNello: false } : {}),
        ...(field === 'isBlindNello' && value ? { bid: 0, isNello: true } : {}),
      }
    }));
  };

  const handleTricksChange = (e: React.ChangeEvent<HTMLInputElement>, team: 1 | 2) => {
    const value = Math.max(0, Math.min(13, parseInt(e.target.value) || 0));
    setCurrentRound(prev => {
      // Calculate what the other team's tricks would be
      const otherTeam = team === 1 ? 2 : 1;
      const otherTeamTricks = team === 1 ? prev.team2Tricks : prev.team1Tricks;
      
      // If this would make total tricks exceed 13, adjust the other team's tricks
      const newOtherTeamTricks = Math.max(0, 13 - value);
      
      return {
        ...prev,
        [`team${team}Tricks`]: value,
        [`team${otherTeam}Tricks`]: newOtherTeamTricks
      };
    });
  };

  const submitBids = () => {
    const totalBids = 
      (currentRound.team1Player1.isNello ? 0 : currentRound.team1Player1.bid) +
      (currentRound.team1Player2.isNello ? 0 : currentRound.team1Player2.bid) +
      (currentRound.team2Player1.isNello ? 0 : currentRound.team2Player1.bid) +
      (currentRound.team2Player2.isNello ? 0 : currentRound.team2Player2.bid);

    const team1Player1Bid = currentRound.team1Player1.isNello ? (currentRound.team1Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player1.bid;
    const team1Player2Bid = currentRound.team1Player2.isNello ? (currentRound.team1Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player2.bid;
    const team2Player1Bid = currentRound.team2Player1.isNello ? (currentRound.team2Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player1.bid;
    const team2Player2Bid = currentRound.team2Player2.isNello ? (currentRound.team2Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player2.bid;

    const confirmMessage = `Confirm bids:\n\n${team1Score.name}:\n${team1Score.player1Name}: ${team1Player1Bid}\n${team1Score.player2Name}: ${team1Player2Bid}\n\n${team2Score.name}:\n${team2Score.player1Name}: ${team2Player1Bid}\n${team2Score.player2Name}: ${team2Player2Bid}\n\nTotal bids: ${totalBids}`;

    if (window.confirm(confirmMessage)) {
      setCurrentRound(prev => ({
        ...prev,
        biddingComplete: true
      }));
    }
  };

  const submitTricks = () => {
    const totalTricks = currentRound.team1Tricks + currentRound.team2Tricks;

    if (totalTricks !== 13) {
      alert("Total tricks must equal 13!");
      return;
    }

    const team1Player1Bid = currentRound.team1Player1.isNello ? (currentRound.team1Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player1.bid;
    const team1Player2Bid = currentRound.team1Player2.isNello ? (currentRound.team1Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player2.bid;
    const team2Player1Bid = currentRound.team2Player1.isNello ? (currentRound.team2Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player1.bid;
    const team2Player2Bid = currentRound.team2Player2.isNello ? (currentRound.team2Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player2.bid;
    
    const team1Bids = `${team1Player1Bid} + ${team1Player2Bid}`;
    const team2Bids = `${team2Player1Bid} + ${team2Player2Bid}`;

    const confirmMessage = `Confirm tricks:\n\n${team1Score.name}:\nBids: ${team1Bids}\nTricks Won: ${currentRound.team1Tricks}\n\n${team2Score.name}:\nBids: ${team2Bids}\nTricks Won: ${currentRound.team2Tricks}`;

    if (window.confirm(confirmMessage)) {
      setCurrentRound(prev => ({
        ...prev,
        tricksComplete: true
      }));
    }
  };

  const handleNelloResult = (team: 1 | 2, player: 1 | 2, success: boolean) => {
    const playerKey = `team${team}Player${player}` as keyof Round;
    setCurrentRound(prev => ({
      ...prev,
      [playerKey]: {
        ...(prev[playerKey] as Player),
        nelloSuccess: success
      }
    }));
  };

  const finalizeRound = () => {
    if (!currentRound.yellowCardsComplete) {
      alert("Please complete the Yellow Card Check first!");
      return;
    }

    // Calculate new scores first to show in confirmation
    const newTeam1Score = calculateTeamScore(
      [currentRound.team1Player1, currentRound.team1Player2],
      currentRound.team1Tricks,
      team1Score,
      currentRound.team1YellowCards || 0,
      true  // This is the final calculation
    );
    const newTeam2Score = calculateTeamScore(
      [currentRound.team2Player1, currentRound.team2Player2],
      currentRound.team2Tricks,
      team2Score,
      currentRound.team2YellowCards || 0,
      true  // This is the final calculation
    );

    // Calculate point changes
    const team1PointChange = newTeam1Score.score - team1Score.score;
    const team2PointChange = newTeam2Score.score - team2Score.score;

    // Calculate total bags for tournament mode
    const newTotalBagsTeam1 = totalBagsTeam1 + currentRound.team1Bags;
    const newTotalBagsTeam2 = totalBagsTeam2 + currentRound.team2Bags;

    // Calculate total yellow cards
    const totalTeam1YellowCards = history.reduce((sum, round) => sum + (round.team1YellowCards || 0), 0) + (currentRound.team1YellowCards || 0);
    const totalTeam2YellowCards = history.reduce((sum, round) => sum + (round.team2YellowCards || 0), 0) + (currentRound.team2YellowCards || 0);

    // Calculate new yellow card penalties
    const team1TotalPenalties = Math.floor(totalTeam1YellowCards / 2);
    const team1PreviousPenalties = Math.floor(team1Score.penalizedYellowCards / 2);
    const team1NewPenalties = team1TotalPenalties - team1PreviousPenalties;
    
    const team2TotalPenalties = Math.floor(totalTeam2YellowCards / 2);
    const team2PreviousPenalties = Math.floor(team2Score.penalizedYellowCards / 2);
    const team2NewPenalties = team2TotalPenalties - team2PreviousPenalties;

    const confirmMessage = `Round Summary:\n\n${team1Score.name}:\nPoints: ${team1Score.score} → ${newTeam1Score.score} (${team1PointChange >= 0 ? '+' : ''}${team1PointChange})\nBags: ${team1Score.bags} → ${newTeam1Score.bags}\nTotal Bags: ${newTotalBagsTeam1}\nYellow Cards This Round: ${currentRound.team1YellowCards || 0}\nTotal Yellow Cards: ${totalTeam1YellowCards}\nNew Yellow Card Penalty: ${team1NewPenalties > 0 ? `-${team1NewPenalties * 50}` : '0'} points\n\n${team2Score.name}:\nPoints: ${team2Score.score} → ${newTeam2Score.score} (${team2PointChange >= 0 ? '+' : ''}${team2PointChange})\nBags: ${team2Score.bags} → ${newTeam2Score.bags}\nTotal Bags: ${newTotalBagsTeam2}\nYellow Cards This Round: ${currentRound.team2YellowCards || 0}\nTotal Yellow Cards: ${totalTeam2YellowCards}\nNew Yellow Card Penalty: ${team2NewPenalties > 0 ? `-${team2NewPenalties * 50}` : '0'} points\n\nConfirm to finalize round?`;

    if (window.confirm(confirmMessage)) {
      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);
      setTotalBagsTeam1(newTotalBagsTeam1);
      setTotalBagsTeam2(newTotalBagsTeam2);

      // Calculate bags for the round
      const team1RoundBags = Math.max(0, currentRound.team1Tricks - 
        (currentRound.team1Player1.isNello ? 0 : currentRound.team1Player1.bid) -
        (currentRound.team1Player2.isNello ? 0 : currentRound.team1Player2.bid));
      
      const team2RoundBags = Math.max(0, currentRound.team2Tricks - 
        (currentRound.team2Player1.isNello ? 0 : currentRound.team2Player1.bid) -
        (currentRound.team2Player2.isNello ? 0 : currentRound.team2Player2.bid));

      const roundWithBags = {
        ...currentRound,
        team1Bags: team1RoundBags,
        team2Bags: team2RoundBags
      };

      setHistory(prev => [...prev, roundWithBags]);
      setCurrentRound(initialRoundState);
      setRoundNumber(prev => prev + 1);

      // Check for game end conditions in tournament mode
      if (isTournamentRules && !isFinalsGame) {
        if (roundNumber >= 8 || newTeam1Score.score >= 250 || newTeam2Score.score >= 250) {
          let winner;
          if (newTeam1Score.score === newTeam2Score.score) {
            // If scores are tied, use total bags as tiebreaker
            winner = newTotalBagsTeam1 < newTotalBagsTeam2 ? team1Score.name : team2Score.name;
          } else {
            winner = newTeam1Score.score > newTeam2Score.score ? team1Score.name : team2Score.name;
          }
          setTimeout(() => {
            alert(`Game Over! ${winner} wins!\n\nFinal Scores:\n${team1Score.name}: ${newTeam1Score.score} (${newTotalBagsTeam1} total bags)\n${team2Score.name}: ${newTeam2Score.score} (${newTotalBagsTeam2} total bags)`);
          }, 100);
        }
      } else {
        // Regular winning condition check
        const winningScore = isTournamentRules && isFinalsGame ? 500 : (isShortGame ? 250 : 500);
        if (newTeam1Score.score >= winningScore || newTeam2Score.score >= winningScore) {
          let winner;
          if (newTeam1Score.score === newTeam2Score.score) {
            // If scores are tied, use total bags as tiebreaker
            winner = newTotalBagsTeam1 < newTotalBagsTeam2 ? team1Score.name : team2Score.name;
          } else {
            winner = newTeam1Score.score > newTeam2Score.score ? team1Score.name : team2Score.name;
          }
          setTimeout(() => {
            alert(`Game Over! ${winner} wins!\n\nFinal Scores:\n${team1Score.name}: ${newTeam1Score.score} (${newTotalBagsTeam1} total bags)\n${team2Score.name}: ${newTeam2Score.score} (${newTotalBagsTeam2} total bags)`);
          }, 100);
        }
      }
    }
  };

  const handleNameChange = (
    team: 1 | 2,
    field: 'name' | 'player1Name' | 'player2Name',
    value: string
  ) => {
    if (team === 1) {
      setTeam1Score(prev => ({ ...prev, [field]: value }));
    } else {
      setTeam2Score(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderTeamHeader = (team: 1 | 2, teamScore: TeamScore) => {
    return (
      <div className="text-center mb-8">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={teamScore.name}
              onChange={(e) => handleNameChange(team, 'name', e.target.value)}
              className="w-full text-xl font-semibold text-center p-1 rounded border"
              placeholder="Team Name"
            />
            <input
              type="text"
              value={teamScore.player1Name}
              onChange={(e) => handleNameChange(team, 'player1Name', e.target.value)}
              className="w-full text-sm text-center p-1 rounded border"
              placeholder="Player 1 Name"
            />
            <input
              type="text"
              value={teamScore.player2Name}
              onChange={(e) => handleNameChange(team, 'player2Name', e.target.value)}
              className="w-full text-sm text-center p-1 rounded border"
              placeholder="Player 2 Name"
            />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-1">{teamScore.name}</h2>
            <p className="text-sm mb-1">{teamScore.player1Name} & {teamScore.player2Name}</p>
          </>
        )}
        <p className="text-2xl mb-1">Score: {teamScore.score}</p>
        <p className="text-sm">Bags: {teamScore.bags}</p>
      </div>
    );
  };

  const renderNelloConfirmation = (team: 1 | 2, player: 1 | 2) => {
    const playerKey = `team${team}Player${player}` as keyof Round;
    const playerData = currentRound[playerKey] as Player;
    const teamScore = team === 1 ? team1Score : team2Score;
    const otherTeamScore = team === 1 ? team2Score : team1Score;
    const playerName = player === 1 ? teamScore.player1Name : teamScore.player2Name;
    const pointDifference = otherTeamScore.score - teamScore.score;
    const canUseBlindNello = (!isTournamentRules || isFinalsGame) && pointDifference >= 250;

    if (!playerData.isNello) return null;

    return (
      <div className="mb-4">
        <h5 className="font-semibold mb-2">{playerName} Nello Result:</h5>
        <div className="flex gap-2">
          <button
            onClick={() => handleNelloResult(team, player, true)}
            className={`button-card ${
              playerData.nelloSuccess === true 
                ? 'bg-green-500 text-white' 
                : 'hover:bg-green-500 hover:text-white'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => handleNelloResult(team, player, false)}
            className={`button-card ${
              playerData.nelloSuccess === false 
                ? 'bg-red-500 text-white' 
                : 'hover:bg-red-500 hover:text-white'
            }`}
          >
            Failed
          </button>
        </div>
      </div>
    );
  };

  const renderPlayerInput = (team: 1 | 2, player: 1 | 2) => {
    const playerKey = `team${team}Player${player}` as keyof Round;
    const playerData = currentRound[playerKey] as Player;
    const teamScore = team === 1 ? team1Score : team2Score;
    const otherTeamScore = team === 1 ? team2Score : team1Score;
    const playerName = player === 1 ? teamScore.player1Name : teamScore.player2Name;
    const pointDifference = otherTeamScore.score - teamScore.score;
    const canUseBlindNello = (!isTournamentRules || isFinalsGame) && pointDifference >= 250;

    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded">
        <h4 className="font-semibold mb-3">{playerName}</h4>
        <label className="block mb-2">
          Bid:
          <input
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            min="0"
            value={playerData.bid}
            onChange={(e) => handleInputChange(e, team, player, 'bid')}
            disabled={playerData.isNello || isEditing}
            className={`w-full mt-1 p-2 rounded border dark:bg-gray-600 ${(playerData.isNello || isEditing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </label>
        <div className="space-y-2">
          <label className="block">
            <input
              type="checkbox"
              checked={playerData.isNello}
              onChange={(e) => handleInputChange(e, team, player, 'isNello')}
              disabled={isEditing || playerData.isBlindNello}
              className={`mr-2 ${(isEditing || playerData.isBlindNello) ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            Nello
          </label>
          {canUseBlindNello && (
            <label className="block">
              <input
                type="checkbox"
                checked={playerData.isBlindNello}
                onChange={(e) => handleInputChange(e, team, player, 'isBlindNello')}
                disabled={isEditing}
                className={`mr-2 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              Blind Nello
            </label>
          )}
        </div>
      </div>
    );
  };

  const allNelloResultsSubmitted = () => {
    const checkPlayer = (player: Player) => {
      return !player.isNello || (player.isNello && typeof player.nelloSuccess === 'boolean');
    };

    return checkPlayer(currentRound.team1Player1) &&
           checkPlayer(currentRound.team1Player2) &&
           checkPlayer(currentRound.team2Player1) &&
           checkPlayer(currentRound.team2Player2);
  };

  const resetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? Team names and player names will be kept, but all scores and history will be cleared.')) {
      const newTeam1Score = { 
        ...team1Score, 
        score: 0,
        bags: 0,
        penalizedYellowCards: 0
      };
      const newTeam2Score = { 
        ...team2Score, 
        score: 0,
        bags: 0,
        penalizedYellowCards: 0
      };
      
      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);
      setCurrentRound(initialRoundState);
      setHistory([]);
      
      localStorage.setItem('team1Score', JSON.stringify(newTeam1Score));
      localStorage.setItem('team2Score', JSON.stringify(newTeam2Score));
      localStorage.setItem('currentRound', JSON.stringify(initialRoundState));
      localStorage.setItem('history', JSON.stringify([]));
    }
  };

  const resetEverything = () => {
    if (window.confirm('Are you sure you want to reset EVERYTHING? All scores, history, team names, and player names will be cleared.')) {
      const newTeam1Score = { 
        score: 0, 
        bags: 0, 
        name: "Team 1",
        player1Name: "Player 1",
        player2Name: "Player 2",
        penalizedYellowCards: 0
      };
      const newTeam2Score = { 
        score: 0, 
        bags: 0,
        name: "Team 2",
        player1Name: "Player 1",
        player2Name: "Player 2",
        penalizedYellowCards: 0
      };
      
      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);
      setCurrentRound(initialRoundState);
      setHistory([]);
      setIsEditing(false);
      
      localStorage.setItem('team1Score', JSON.stringify(newTeam1Score));
      localStorage.setItem('team2Score', JSON.stringify(newTeam2Score));
      localStorage.setItem('currentRound', JSON.stringify(initialRoundState));
      localStorage.setItem('history', JSON.stringify([]));
      localStorage.setItem('isEditing', JSON.stringify(false));
    }
  };

  const handleHistoryEdit = (index: number, field: HistoryEditField, value: any) => {
    if (editingRound === null) return;
    
    setEditingRound(prev => {
      if (!prev) return prev;
      
      if (field.includes('_')) {
        // Handle player bid and nello updates
        const [team, player, subField] = field.split('_');
        const playerKey = `${team}Player${player}` as keyof Round;
        
        if (subField === 'bid') {
          const numValue = Math.max(0, Math.min(13, parseInt(value) || 0));
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              bid: numValue
            }
          };
        } else if (subField === 'isNello') {
          const boolValue = Boolean(value);
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              isNello: boolValue,
              bid: boolValue ? 0 : (prev[playerKey] as Player).bid // Reset bid to 0 if Nello is checked
            }
          };
        } else if (subField === 'nelloSuccess') {
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              nelloSuccess: value === "true"
            }
          };
        }
      } else {
        // Handle tricks updates
        const numValue = Math.max(0, Math.min(13, parseInt(value) || 0));
        return {
          ...prev,
          [field]: numValue
        };
      }
      
      return prev;
    });
  };

  const startHistoryEdit = (index: number) => {
    setEditingHistoryIndex(index);
    setEditingRound({...history[index]});
  };

  const cancelHistoryEdit = () => {
    setEditingHistoryIndex(null);
    setEditingRound(null);
  };

  const saveHistoryEdit = async () => {
    if (editingHistoryIndex === null || !editingRound) return;

    // Validate total tricks
    const totalTricks = editingRound.team1Tricks + editingRound.team2Tricks;
    if (totalTricks !== 13) {
      alert("Total tricks must equal 13!");
      return;
    }

    // Calculate new scores from the beginning up to this point
    let newTeam1Score = { ...team1Score, score: 0, bags: 0 };
    let newTeam2Score = { ...team2Score, score: 0, bags: 0 };

    // Recalculate all scores up to the current point
    for (let i = 0; i <= editingHistoryIndex; i++) {
      const round = i === editingHistoryIndex ? editingRound : history[i];
      
      newTeam1Score = calculateTeamScore(
        [round.team1Player1, round.team1Player2],
        round.team1Tricks,
        newTeam1Score,
        round.team1YellowCards
      );
      
      newTeam2Score = calculateTeamScore(
        [round.team2Player1, round.team2Player2],
        round.team2Tricks,
        newTeam2Score,
        round.team2YellowCards
      );
    }

    const confirmMessage = `This will update the scores to:\n\n${team1Score.name}: ${newTeam1Score.score} (${newTeam1Score.bags} bags)\n${team2Score.name}: ${newTeam2Score.score} (${newTeam2Score.bags} bags)\n\nAre you sure you want to make this change?`;

    if (window.confirm(confirmMessage)) {
      const newHistory = [...history];
      newHistory[editingHistoryIndex] = editingRound;
      
      setHistory(newHistory);
      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);
      setEditingHistoryIndex(null);
      setEditingRound(null);

      // Save to localStorage
      localStorage.setItem('history', JSON.stringify(newHistory));
      localStorage.setItem('team1Score', JSON.stringify(newTeam1Score));
      localStorage.setItem('team2Score', JSON.stringify(newTeam2Score));
    }
  };

  // Add this function to calculate cumulative bags up to a specific round
  const calculateCumulativeBags = (roundIndex: number, team: 1 | 2) => {
    let totalBags = 0;
    for (let i = 0; i <= roundIndex; i++) {
      const round = history[i];
      const roundBags = team === 1 ? round.team1Bags : round.team2Bags;
      totalBags += roundBags;
      
      // Reset bags when penalty threshold is reached
      const threshold = isTournamentRules ? 7 : (isShortGame ? 5 : 10);
      if (totalBags >= threshold) {
        totalBags = totalBags % threshold;
      }
    }
    return totalBags;
  };

  const calculateCumulativeYellowCards = (roundIndex: number, team: 1 | 2) => {
    let yellowCards = 0;
    for (let i = 0; i <= roundIndex; i++) {
      yellowCards += history[i][`team${team}YellowCards`] || 0;
    }
    return yellowCards;
  };

  const calculatePreviewScores = () => {
    const newTeam1Score = calculateTeamScore(
      [currentRound.team1Player1, currentRound.team1Player2],
      currentRound.team1Tricks,
      team1Score,
      currentRound.team1YellowCards || 0,
      false  // This is just a preview, not the final calculation
    );
    const newTeam2Score = calculateTeamScore(
      [currentRound.team2Player1, currentRound.team2Player2],
      currentRound.team2Tricks,
      team2Score,
      currentRound.team2YellowCards || 0,
      false  // This is just a preview, not the final calculation
    );

    return { newTeam1Score, newTeam2Score };
  };

  const renderScorePreview = () => {
    const { newTeam1Score, newTeam2Score } = calculatePreviewScores();
    const team1PointChange = newTeam1Score.score - team1Score.score;
    const team2PointChange = newTeam2Score.score - team2Score.score;

    // Calculate total yellow cards including current round
    const totalTeam1YellowCards = history.reduce((sum, round) => sum + (round.team1YellowCards || 0), 0) + (currentRound.team1YellowCards || 0);
    const totalTeam2YellowCards = history.reduce((sum, round) => sum + (round.team2YellowCards || 0), 0) + (currentRound.team2YellowCards || 0);

    // Calculate how many new penalties each team will receive
    const team1TotalPenalties = Math.floor(totalTeam1YellowCards / 2);
    const team1PreviousPenalties = Math.floor(team1Score.penalizedYellowCards / 2);
    const team1NewPenalties = team1TotalPenalties - team1PreviousPenalties;
    
    const team2TotalPenalties = Math.floor(totalTeam2YellowCards / 2);
    const team2PreviousPenalties = Math.floor(team2Score.penalizedYellowCards / 2);
    const team2NewPenalties = team2TotalPenalties - team2PreviousPenalties;

    return (
      <div className="card-style spade-pattern p-4 my-4">
        <h3 className="text-xl font-bold mb-4">Yellow Card Check</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Team 1 Yellow Cards */}
          <div className="card-style p-4">
            <h4 className="text-xl font-semibold mb-4">{team1Score.name}</h4>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm">Current Round Table Talk / Misplays:</span>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  min="0"
                  value={currentRound.team1YellowCards === 0 ? '' : currentRound.team1YellowCards}
                  onChange={(e) => setCurrentRound(prev => ({
                    ...prev,
                    team1YellowCards: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  disabled={isEditing}
                  placeholder="0"
                  className={`w-full mt-1 p-2 rounded border ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </label>
              <p className="text-sm font-medium">
                Total Yellow Cards: {totalTeam1YellowCards}
              </p>
              <p className="text-sm font-medium">
                Previously Penalized: {team1Score.penalizedYellowCards} cards ({team1PreviousPenalties} sets)
              </p>
              <p className="text-sm text-yellow-600">
                New Penalty: -{team1NewPenalties * 50} points ({team1NewPenalties} new sets)
              </p>
            </div>
          </div>

          {/* Team 2 Yellow Cards */}
          <div className="card-style p-4">
            <h4 className="text-xl font-semibold mb-4">{team2Score.name}</h4>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm">Current Round Table Talk / Misplays:</span>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  min="0"
                  value={currentRound.team2YellowCards === 0 ? '' : currentRound.team2YellowCards}
                  onChange={(e) => setCurrentRound(prev => ({
                    ...prev,
                    team2YellowCards: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  disabled={isEditing}
                  placeholder="0"
                  className={`w-full mt-1 p-2 rounded border ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </label>
              <p className="text-sm font-medium">
                Total Yellow Cards: {totalTeam2YellowCards}
              </p>
              <p className="text-sm font-medium">
                Previously Penalized: {team2Score.penalizedYellowCards} cards ({team2PreviousPenalties} sets)
              </p>
              <p className="text-sm text-yellow-600">
                New Penalty: -{team2NewPenalties * 50} points ({team2NewPenalties} new sets)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentRound(prev => ({ ...prev, yellowCardsComplete: true }))}
          className={`button-card bg-blue-500 text-white w-full py-2 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isEditing}
        >
          Confirm Yellow Cards
        </button>

        {currentRound.yellowCardsComplete && (
          <>
            <h3 className="text-xl font-bold mb-4 mt-8">Score Preview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team 1 */}
              <div className="card-style p-4">
                <h4 className="text-xl font-semibold mb-4">{team1Score.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lg">
                    <span>Points: {team1Score.score}</span>
                    <span className="text-gray-500">→</span>
                    <span className={`font-medium ${team1PointChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {newTeam1Score.score} ({team1PointChange >= 0 ? '+' : ''}{team1PointChange})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-lg">
                    <span>Bags: {team1Score.bags}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium">{newTeam1Score.bags}</span>
                  </div>
                </div>
              </div>

              {/* Team 2 */}
              <div className="card-style p-4">
                <h4 className="text-xl font-semibold mb-4">{team2Score.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lg">
                    <span>Points: {team2Score.score}</span>
                    <span className="text-gray-500">→</span>
                    <span className={`font-medium ${team2PointChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {newTeam2Score.score} ({team2PointChange >= 0 ? '+' : ''}{team2PointChange})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-lg">
                    <span>Bags: {team2Score.bags}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium">{newTeam2Score.bags}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Round Details */}
            <div className="mt-8">
              <h4 className="text-xl font-semibold mb-4">Round Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="card-style p-4">
                  <div className="space-y-3">
                    <p className="text-lg">{team1Score.player1Name}: {currentRound.team1Player1.isNello ? 'Nello' : currentRound.team1Player1.bid}</p>
                    <p className="text-lg">{team1Score.player2Name}: {currentRound.team1Player2.isNello ? 'Nello' : currentRound.team1Player2.bid}</p>
                    <p className="text-lg font-medium mt-4">Tricks: {currentRound.team1Tricks}</p>
                    <p className="text-lg font-medium">Yellow Cards: {currentRound.team1YellowCards || 0}</p>
                  </div>
                </div>
                <div className="card-style p-4">
                  <div className="space-y-3">
                    <p className="text-lg">{team2Score.player1Name}: {currentRound.team2Player1.isNello ? 'Nello' : currentRound.team2Player1.bid}</p>
                    <p className="text-lg">{team2Score.player2Name}: {currentRound.team2Player2.isNello ? 'Nello' : currentRound.team2Player2.bid}</p>
                    <p className="text-lg font-medium mt-4">Tricks: {currentRound.team2Tricks}</p>
                    <p className="text-lg font-medium">Yellow Cards: {currentRound.team2YellowCards || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setCurrentRound(prev => ({ 
                    ...prev, 
                    tricksComplete: false,
                    biddingComplete: false
                  }));
                }}
                className={`button-card bg-blue-500 text-white px-6 py-2 text-lg ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isEditing}
              >
                Edit Bids & Tricks
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto p-2">
        <div className="card-style spade-pattern p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold">♠ Spades Scorecard</h1>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={isTournamentRules ? "tournament" : (isShortGame ? "short" : "regular")}
                  onChange={(e) => {
                    setIsShortGame(e.target.value === "short");
                    setIsTournamentRules(e.target.value === "tournament");
                    if (e.target.value !== "tournament") {
                      setIsFinalsGame(false);
                    }
                    // Reset round number when changing game type
                    setRoundNumber(1);
                    setTotalBagsTeam1(0);
                    setTotalBagsTeam2(0);
                  }}
                  className={`px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isEditing}
                >
                  <option value="regular">Regular Game (500 pts)</option>
                  <option value="short">Short Game (250 pts)</option>
                  <option value="tournament">Tournament Rules!</option>
                </select>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  {isTournamentRules ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <span>{isFinalsGame ? "10 bags = -100 pts" : "5 bags = -50 pts"}</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isFinalsGame}
                            onChange={(e) => {
                              setIsFinalsGame(e.target.checked);
                              // Reset round number when changing game type
                              setRoundNumber(1);
                              setTotalBagsTeam1(0);
                              setTotalBagsTeam2(0);
                            }}
                            disabled={isEditing}
                            className={`sr-only ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          <div className={`w-10 h-6 ${isFinalsGame ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full transition-colors duration-200 ease-in-out ${isEditing ? 'opacity-50' : ''}`}>
                            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${isFinalsGame ? 'translate-x-4' : 'translate-x-0'} ${isEditing ? 'cursor-not-allowed' : ''}`}></div>
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-medium">{isFinalsGame ? 'Finals Game' : 'Regular Game'}</span>
                      </label>
                      {!isFinalsGame && (
                        <span className="text-xs">
                          Round {roundNumber}/8
                        </span>
                      )}
                    </div>
                  ) : (
                    isShortGame ? "5 bags = -50 pts" : "10 bags = -100 pts"
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`button-card px-2 py-1 text-sm ${isEditing ? 'bg-green-500 text-white' : ''}`}
              >
                {isEditing ? "Save Names" : "Edit Names"}
              </button>
              <button
                onClick={resetGame}
                className="button-card bg-yellow-500 text-white px-2 py-1 text-sm"
                disabled={isEditing}
              >
                Reset Game
              </button>
              <button
                onClick={resetEverything}
                className="button-card bg-red-500 text-white px-2 py-1 text-sm"
                disabled={isEditing}
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left Column - Team 1 */}
          <div className="card-style spade-pattern p-3 sm:p-4">
            {renderTeamHeader(1, team1Score)}
            
            {!currentRound.biddingComplete ? (
              <div className="space-y-4">
                {renderPlayerInput(1, 1)}
                {renderPlayerInput(1, 2)}
              </div>
            ) : !currentRound.tricksComplete ? (
              <div className="card-style p-4">
                <h4 className="font-semibold mb-3">{team1Score.name}</h4>
                <div className="mb-2 text-sm">
                  Bids: {currentRound.team1Player1.isNello ? (currentRound.team1Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player1.bid} + {currentRound.team1Player2.isNello ? (currentRound.team1Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player2.bid}
                </div>
                <label className="block">
                  <span className="text-sm">Tricks Won:</span>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    min="0"
                    max="13"
                    value={currentRound.team1Tricks}
                    onChange={(e) => handleTricksChange(e, 1)}
                    disabled={isEditing}
                    className={`input-card w-full mt-1 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {renderNelloConfirmation(1, 1)}
                {renderNelloConfirmation(1, 2)}
              </div>
            )}
          </div>

          {/* Right Column - Team 2 */}
          <div className="card-style spade-pattern p-3 sm:p-4">
            {renderTeamHeader(2, team2Score)}
            
            {!currentRound.biddingComplete ? (
              <div className="space-y-4">
                {renderPlayerInput(2, 1)}
                {renderPlayerInput(2, 2)}
              </div>
            ) : !currentRound.tricksComplete ? (
              <div className="card-style p-4">
                <h4 className="font-semibold mb-3">{team2Score.name}</h4>
                <div className="mb-2 text-sm">
                  Bids: {currentRound.team2Player1.isNello ? (currentRound.team2Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player1.bid} + {currentRound.team2Player2.isNello ? (currentRound.team2Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player2.bid}
                </div>
                <label className="block">
                  <span className="text-sm">Tricks Won:</span>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    min="0"
                    max="13"
                    value={currentRound.team2Tricks}
                    onChange={(e) => handleTricksChange(e, 2)}
                    disabled={isEditing}
                    className={`input-card w-full mt-1 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {renderNelloConfirmation(2, 1)}
                {renderNelloConfirmation(2, 2)}
              </div>
            )}
          </div>
        </div>

        {currentRound.tricksComplete && renderScorePreview()}

        {!currentRound.tricksComplete && currentRound.biddingComplete && (
          <div className="text-center text-sm mt-4">
            <p className="mb-2">
              Total Tricks: {currentRound.team1Tricks + currentRound.team2Tricks}/13
            </p>
            {currentRound.team1Tricks + currentRound.team2Tricks !== 13 && (
              <p className="text-red-500">
                Total tricks must equal 13
              </p>
            )}
          </div>
        )}

        <button
          onClick={
            !currentRound.biddingComplete ? submitBids :
            !currentRound.tricksComplete ? submitTricks :
            finalizeRound
          }
          disabled={
            isEditing ||
            (currentRound.tricksComplete && !allNelloResultsSubmitted()) ||
            (!currentRound.tricksComplete && currentRound.biddingComplete && 
             currentRound.team1Tricks + currentRound.team2Tricks !== 13)
          }
          className={`button-card w-full mt-6 ${
            isEditing || (currentRound.tricksComplete && !allNelloResultsSubmitted()) ||
            (!currentRound.tricksComplete && currentRound.biddingComplete && 
             currentRound.team1Tricks + currentRound.team2Tricks !== 13)
              ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
              : 'bg-blue-500 text-white'
          }`}
        >
          {!currentRound.biddingComplete ? "Submit Bids" :
           !currentRound.tricksComplete ? "Submit Tricks" :
           "Finalize Round"}
        </button>

        {history.length > 0 && (
          <div className="card-style mt-6 overflow-hidden">
            <h3 className="text-base font-semibold p-3 border-b dark:border-gray-700">Round History</h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 whitespace-nowrap">
                      <th className="p-2 text-xs sm:text-sm">Round</th>
                      <th className="p-2 text-xs sm:text-sm">{team1Score.player1Name}</th>
                      <th className="p-2 text-xs sm:text-sm">{team1Score.player2Name}</th>
                      <th className="p-2 text-xs sm:text-sm">{team1Score.name} Tricks</th>
                      <th className="p-2 text-xs sm:text-sm">{team1Score.name} Bags</th>
                      <th className="p-2 text-xs sm:text-sm">{team1Score.name} YC</th>
                      <th className="p-2 text-xs sm:text-sm">{team1Score.name} Points</th>
                      <th className="p-2 text-xs sm:text-sm">{team2Score.player1Name}</th>
                      <th className="p-2 text-xs sm:text-sm">{team2Score.player2Name}</th>
                      <th className="p-2 text-xs sm:text-sm">{team2Score.name} Tricks</th>
                      <th className="p-2 text-xs sm:text-sm">{team2Score.name} Bags</th>
                      <th className="p-2 text-xs sm:text-sm">{team2Score.name} YC</th>
                      <th className="p-2 text-xs sm:text-sm">{team2Score.name} Points</th>
                      <th className="p-2 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((round, index) => {
                      const isEditing = editingHistoryIndex === index;
                      const currentRound = isEditing ? editingRound! : round;
                      
                      // Calculate cumulative points up to this round
                      let team1CumulativePoints = 0;
                      let team2CumulativePoints = 0;
                      for (let i = 0; i <= index; i++) {
                        const roundToCalculate = i === index && isEditing ? editingRound! : history[i];
                        const team1RoundScore = calculateTeamScore(
                          [roundToCalculate.team1Player1, roundToCalculate.team1Player2],
                          roundToCalculate.team1Tricks,
                          { ...team1Score, score: team1CumulativePoints, bags: 0 },
                          roundToCalculate.team1YellowCards
                        );
                        const team2RoundScore = calculateTeamScore(
                          [roundToCalculate.team2Player1, roundToCalculate.team2Player2],
                          roundToCalculate.team2Tricks,
                          { ...team2Score, score: team2CumulativePoints, bags: 0 },
                          roundToCalculate.team2YellowCards
                        );
                        team1CumulativePoints = team1RoundScore.score;
                        team2CumulativePoints = team2RoundScore.score;
                      }
                      
                      return (
                        <tr key={index} className="border-b dark:border-gray-700 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2 text-center text-xs sm:text-sm">{index + 1}</td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  min="0"
                                  max="13"
                                  value={currentRound.team1Player1.bid}
                                  onChange={(e) => handleHistoryEdit(index, 'team1_1_bid', e.target.value)}
                                  disabled={currentRound.team1Player1.isNello}
                                  className="w-16 text-center p-1 rounded border"
                                />
                                <label className="flex items-center justify-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={currentRound.team1Player1.isNello}
                                    onChange={(e) => handleHistoryEdit(index, 'team1_1_isNello', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-xs">Nello</span>
                                </label>
                                {currentRound.team1Player1.isNello && (
                                  <select
                                    value={currentRound.team1Player1.nelloSuccess ? "true" : "false"}
                                    onChange={(e) => handleHistoryEdit(index, 'team1_1_nelloSuccess', e.target.value === "true")}
                                    className="w-16 text-center p-1 rounded border text-xs"
                                  >
                                    <option value="true">✓</option>
                                    <option value="false">✗</option>
                                  </select>
                                )}
                              </div>
                            ) : (
                              currentRound.team1Player1.isNello 
                                ? `Nello ${currentRound.team1Player1.nelloSuccess ? '♠' : '×'}` 
                                : currentRound.team1Player1.bid
                            )}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  min="0"
                                  max="13"
                                  value={currentRound.team1Player2.bid}
                                  onChange={(e) => handleHistoryEdit(index, 'team1_2_bid', e.target.value)}
                                  disabled={currentRound.team1Player2.isNello}
                                  className="w-16 text-center p-1 rounded border"
                                />
                                <label className="flex items-center justify-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={currentRound.team1Player2.isNello}
                                    onChange={(e) => handleHistoryEdit(index, 'team1_2_isNello', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-xs">Nello</span>
                                </label>
                                {currentRound.team1Player2.isNello && (
                                  <select
                                    value={currentRound.team1Player2.nelloSuccess ? "true" : "false"}
                                    onChange={(e) => handleHistoryEdit(index, 'team1_2_nelloSuccess', e.target.value === "true")}
                                    className="w-16 text-center p-1 rounded border text-xs"
                                  >
                                    <option value="true">✓</option>
                                    <option value="false">✗</option>
                                  </select>
                                )}
                              </div>
                            ) : (
                              currentRound.team1Player2.isNello 
                                ? `Nello ${currentRound.team1Player2.nelloSuccess ? '♠' : '×'}` 
                                : currentRound.team1Player2.bid
                            )}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <input
                                type="text"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                min="0"
                                max="13"
                                value={currentRound.team1Tricks}
                                onChange={(e) => handleHistoryEdit(index, 'team1Tricks', e.target.value)}
                                className="w-16 text-center p-1 rounded border"
                              />
                            ) : currentRound.team1Tricks}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <span>{currentRound.team1Bags}</span>
                            ) : calculateCumulativeBags(index, 1)}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={currentRound.team1YellowCards || 0}
                                onChange={(e) => handleHistoryEdit(index, 'team1YellowCards', e.target.value)}
                                className="w-16 text-center p-1 rounded border"
                              />
                            ) : calculateCumulativeYellowCards(index, 1)}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm font-medium">
                            {team1CumulativePoints}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  min="0"
                                  max="13"
                                  value={currentRound.team2Player1.bid}
                                  onChange={(e) => handleHistoryEdit(index, 'team2_1_bid', e.target.value)}
                                  disabled={currentRound.team2Player1.isNello}
                                  className="w-16 text-center p-1 rounded border"
                                />
                                <label className="flex items-center justify-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={currentRound.team2Player1.isNello}
                                    onChange={(e) => handleHistoryEdit(index, 'team2_1_isNello', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-xs">Nello</span>
                                </label>
                                {currentRound.team2Player1.isNello && (
                                  <select
                                    value={currentRound.team2Player1.nelloSuccess ? "true" : "false"}
                                    onChange={(e) => handleHistoryEdit(index, 'team2_1_nelloSuccess', e.target.value === "true")}
                                    className="w-16 text-center p-1 rounded border text-xs"
                                  >
                                    <option value="true">✓</option>
                                    <option value="false">✗</option>
                                  </select>
                                )}
                              </div>
                            ) : (
                              currentRound.team2Player1.isNello 
                                ? `Nello ${currentRound.team2Player1.nelloSuccess ? '♠' : '×'}` 
                                : currentRound.team2Player1.bid
                            )}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  min="0"
                                  max="13"
                                  value={currentRound.team2Player2.bid}
                                  onChange={(e) => handleHistoryEdit(index, 'team2_2_bid', e.target.value)}
                                  disabled={currentRound.team2Player2.isNello}
                                  className="w-16 text-center p-1 rounded border"
                                />
                                <label className="flex items-center justify-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={currentRound.team2Player2.isNello}
                                    onChange={(e) => handleHistoryEdit(index, 'team2_2_isNello', e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-xs">Nello</span>
                                </label>
                                {currentRound.team2Player2.isNello && (
                                  <select
                                    value={currentRound.team2Player2.nelloSuccess ? "true" : "false"}
                                    onChange={(e) => handleHistoryEdit(index, 'team2_2_nelloSuccess', e.target.value === "true")}
                                    className="w-16 text-center p-1 rounded border text-xs"
                                  >
                                    <option value="true">✓</option>
                                    <option value="false">✗</option>
                                  </select>
                                )}
                              </div>
                            ) : (
                              currentRound.team2Player2.isNello 
                                ? `Nello ${currentRound.team2Player2.nelloSuccess ? '♠' : '×'}` 
                                : currentRound.team2Player2.bid
                            )}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <input
                                type="text"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                min="0"
                                max="13"
                                value={currentRound.team2Tricks}
                                onChange={(e) => handleHistoryEdit(index, 'team2Tricks', e.target.value)}
                                className="w-16 text-center p-1 rounded border"
                              />
                            ) : currentRound.team2Tricks}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <span>{currentRound.team2Bags}</span>
                            ) : calculateCumulativeBags(index, 2)}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={currentRound.team2YellowCards || 0}
                                onChange={(e) => handleHistoryEdit(index, 'team2YellowCards', e.target.value)}
                                className="w-16 text-center p-1 rounded border"
                              />
                            ) : calculateCumulativeYellowCards(index, 2)}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm font-medium">
                            {team2CumulativePoints}
                          </td>
                          <td className="p-2 text-center text-xs sm:text-sm">
                            {isEditing ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={saveHistoryEdit}
                                  className="button-card bg-green-500 text-white px-2 py-1"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelHistoryEdit}
                                  className="button-card bg-red-500 text-white px-2 py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startHistoryEdit(index)}
                                className="button-card bg-blue-500 text-white px-2 py-1"
                                disabled={isEditing || editingHistoryIndex !== null}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Button */}
      <div className="fixed bottom-3 left-3 z-[9999]">
        <button
          onClick={() => setShowRules(true)}
          className="button-card bg-gradient-to-br from-gray-900 to-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 border-2 border-gray-700"
          title="Game Rules"
          aria-label="Show Game Rules"
          disabled={isEditing}
        >
          <span className="text-2xl">♠</span>
        </button>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="card-style spade-pattern w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">♠ Spades Rules</h2>
              <button
                onClick={() => setShowRules(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close Rules"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="prose dark:prose-invert max-w-none">
                {getGameRules(isShortGame, isTournamentRules, isFinalsGame).split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-base sm:text-sm">
                    {paragraph.split('\n').map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < paragraph.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 