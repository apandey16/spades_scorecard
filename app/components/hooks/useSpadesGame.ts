import { useState, useEffect, useCallback } from 'react';
import { 
  Player, 
  TeamScore, 
  Round, 
  GameState, 
  HistoryEditField,
  initialPlayerState,
  initialTeamScoreState,
  initialRoundState
} from '../types';

export default function useSpadesGame() {
  // Game state
  const [team1Score, setTeam1Score] = useState<TeamScore>({
    ...initialTeamScoreState,
    name: 'Team 1',
    player1Name: 'Player 1',
    player2Name: 'Player 2'
  });
  
  const [team2Score, setTeam2Score] = useState<TeamScore>({
    ...initialTeamScoreState,
    name: 'Team 2',
    player1Name: 'Player 3',
    player2Name: 'Player 4'
  });
  
  const [history, setHistory] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round>({
    ...initialRoundState,
    team1Player1: { ...initialPlayerState, name: team1Score.player1Name },
    team1Player2: { ...initialPlayerState, name: team1Score.player2Name },
    team2Player1: { ...initialPlayerState, name: team2Score.player1Name },
    team2Player2: { ...initialPlayerState, name: team2Score.player2Name }
  });
  
  // Game settings
  const [isShortGame, setIsShortGame] = useState(false);
  const [isTournamentRules, setIsTournamentRules] = useState(false);
  const [isFinalsGame, setIsFinalsGame] = useState(false);
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  
  // Preview scores
  const [previewScores, setPreviewScores] = useState<{
    team1: TeamScore;
    team2: TeamScore;
  }>({
    team1: { ...team1Score },
    team2: { ...team2Score }
  });

  // Load game state from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save game state to localStorage when state changes
  useEffect(() => {
    saveToLocalStorage();
    calculatePreviewScores();
  }, [team1Score, team2Score, history, currentRound, isShortGame, isTournamentRules, isFinalsGame]);

  const loadFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem('spadesGameState');
      if (savedState) {
        const parsed = JSON.parse(savedState) as GameState;
        
        setTeam1Score(parsed.team1Score);
        setTeam2Score(parsed.team2Score);
        setHistory(parsed.history);
        setCurrentRound(parsed.currentRound);
        setIsShortGame(parsed.isShortGame);
        setIsTournamentRules(parsed.isTournamentRules);
        setIsFinalsGame(parsed.isFinalsGame);
        setIsEditing(parsed.isEditing);
        setShowRules(parsed.showRules);
      }
    } catch (error) {
      console.error('Error loading game state from localStorage:', error);
    }
  };

  const saveToLocalStorage = () => {
    try {
      const gameState: GameState = {
        team1Score,
        team2Score,
        history,
        currentRound,
        isShortGame,
        isTournamentRules,
        isFinalsGame,
        isEditing,
        showRules
      };
      
      localStorage.setItem('spadesGameState', JSON.stringify(gameState));
    } catch (error) {
      console.error('Error saving game state to localStorage:', error);
    }
  };

  const getGameRules = useCallback((isShort: boolean, isTournament: boolean, isFinals: boolean) => {
    const baseRules = `General Rules: 
- The spade suit is always trump.
- A (high), K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2.
- There are 4 people per game and it is played in teams of 2.

The Deal:
The first dealer is chosen by a draw for high card, and thereafter the turn to deal proceeds clockwise. The entire deck is dealt one at a time, face down, beginning on the dealer's left. The players then pick up their cards and arrange them by suits and rank.

The Bidding:
Each player decides how many tricks (or hands) they will be able to win and the total number of tricks that need to be won by the team is the sum of what each player bid. The player to the dealer's left starts the bidding and, in turn, each player states how many tricks they expect to win. Any player can call 'nello' which implies that they are bidding 0 wins. The total number of tricks between all 4 players must be less than or equal to 13.

The Play:
The player to the dealer's left makes the opening lead, and players must follow suit, if possible. If a player cannot follow suit, they may play any card.

The highest card of the suit led wins a trick, with one exception: if a spade is led, the highest spade wins. If a spade is not led, then any spade played beats the highest card of the suit led. When a player cannot follow suit, they are allowed to play any card, including a spade. The trick is won by the highest spade, or if no spade is played, by the highest card of the suit led. The player who wins each trick leads the next.

Scoring:
For each trick a team correctly bid, the team receives 10 points. If a team does not make their bid, they lose 10 points for each trick they bid. Any trick a team wins beyond their bid is worth 1 point and is called a bag. If a team accumulates 10 bags, they lose 100 points, but the 10 bags are deducted from their running bag total.

Game End:
The first team to reach 500 points wins. If both teams reach 500 points in the same round, the team with the higher score wins. If there is a tie, another round is played.`;

    const shortGameRules = isShort
      ? `\n\nShort Game: The game ends when a team reaches 300 points.`
      : '';

    const tournamentRules = isTournament
      ? `\n\nTournament Rules: 
- Penalty for overbidding: A team only loses points equal to their bid. For example, if a team bids 4 tricks but only wins 2, they lose 40 points.
- Yellow Cards: If a team gets 3 bags in a round, they receive a yellow card. Each yellow card adds a 10-point penalty to the team's score at the end of the round. A team with a total of 5 yellow cards over the course of a game receives an automatic 50-point penalty.
- Nello Bids: A player bidding nello (zero) must take exactly zero tricks. If successful, the team gains 100 points. If unsuccessful, the team loses 100 points.
- Blind Nello: A blind nello bid must be made before a player looks at their cards. If successful, the team gains a bonus (usually 200 points).
- A successful nello does not count as bags for the team.
- Consecutive Nello Bonus: Teams get an additional bonus for consecutive successful nello bids.`
      : '';

    const finalsRules = isFinals
      ? `\n\nFinals Rules:
- Blind Nello: A player can call blind nello when their team is behind by at least 250 points.
- A successful blind nello in the finals is worth 250 points.`
      : '';

    return `${baseRules}${shortGameRules}${tournamentRules}${finalsRules}`;
  }, []);

  const calculateTeamScore = useCallback((
    players: Player[], 
    tricks: number, 
    currentScore: TeamScore,
    yellowCards: number,
    isFinalCalculation: boolean = false
  ) => {
    const newScore = { ...currentScore };
    let scoreChange = 0;
    let bagsChange = 0;
    
    // Calculate base bid for the team
    const teamBid = players.reduce((total, player) => {
      // Nello bids are counted as 0
      return total + (player.blindNil || player.bid === 0 ? 0 : player.bid);
    }, 0);
    
    // Check if any player has a nello bid
    const nelloPlayers = players.filter(p => p.bid === 0 || p.blindNil);
    
    // Add nello points if applicable
    nelloPlayers.forEach(player => {
      if (player.nelloResult !== null) {
        if (player.nelloResult) {
          // Successful nello
          if (player.blindNil) {
            // Blind nello is worth more
            scoreChange += isFinalsGame ? 250 : 200;
            newScore.consecutiveSuccessfulNellos++;
          } else {
            // Regular nello
            scoreChange += 100;
            newScore.consecutiveSuccessfulNellos++;
          }
          
          // Consecutive nello bonus
          if (newScore.consecutiveSuccessfulNellos > 1) {
            scoreChange += (newScore.consecutiveSuccessfulNellos - 1) * 50;
          }
        } else {
          // Failed nello
          scoreChange -= player.blindNil ? (isFinalsGame ? 250 : 200) : 100;
          newScore.consecutiveSuccessfulNellos = 0;
        }
      }
    });
    
    // If no one had a nello bid, calculate normal bid score
    if (nelloPlayers.length === 0) {
      if (tricks >= teamBid) {
        // Made or exceeded bid
        scoreChange += teamBid * 10;
        bagsChange += tricks - teamBid;
      } else {
        // Failed to make bid
        if (isTournamentRules) {
          // Tournament rules: only lose points equal to bid
          scoreChange -= teamBid * 10;
        } else {
          // Standard rules: lose points
          scoreChange -= teamBid * 10;
        }
      }
    }
    
    // Add bags
    newScore.bags += bagsChange;
    
    // Check for bag penalty (every 10 bags)
    if (isFinalCalculation && newScore.bags >= 10) {
      scoreChange -= 100;
      newScore.bags -= 10;
    }
    
    // Add yellow card penalty in tournament rules
    if (isTournamentRules && isFinalCalculation) {
      // Add new yellow cards from this round
      newScore.yellowCards += yellowCards;
      
      // Apply yellow card penalties
      const unpaidYellowCards = newScore.yellowCards - (currentScore.yellowCards || 0);
      if (unpaidYellowCards > 0) {
        scoreChange -= unpaidYellowCards * 10;
      }
      
      // Check for 5 yellow cards total
      if (newScore.yellowCards >= 5 && currentScore.yellowCards < 5) {
        scoreChange -= 50;
      }
    }
    
    // Update final score
    newScore.score += scoreChange;
    
    return { newScore, scoreChange, bagsChange };
  }, [isFinalsGame, isTournamentRules]);

  // Player input handlers
  const updateBid = useCallback((playerIndex: number, bid: number) => {
    setCurrentRound(prev => {
      const updated = { ...prev };
      const playerKey = getPlayerKeyByIndex(playerIndex);
      if (playerKey) {
        updated[playerKey] = {
          ...updated[playerKey],
          bid
        };
      }
      return updated;
    });
  }, []);

  const updateBlindNil = useCallback((playerIndex: number, isBlindNil: boolean) => {
    setCurrentRound(prev => {
      const updated = { ...prev };
      const playerKey = getPlayerKeyByIndex(playerIndex);
      if (playerKey) {
        updated[playerKey] = {
          ...updated[playerKey],
          blindNil: isBlindNil
        };
      }
      return updated;
    });
  }, []);

  const updateTricks = useCallback((playerIndex: number, tricks: number) => {
    setCurrentRound(prev => {
      const updated = { ...prev };
      const playerKey = getPlayerKeyByIndex(playerIndex);
      if (playerKey) {
        updated[playerKey] = {
          ...updated[playerKey],
          tricks
        };
      }
      return updated;
    });
  }, []);

  const updateNelloResult = useCallback((playerIndex: number, success: boolean | null) => {
    setCurrentRound(prev => {
      const updated = { ...prev };
      const playerKey = getPlayerKeyByIndex(playerIndex);
      if (playerKey) {
        updated[playerKey] = {
          ...updated[playerKey],
          nelloResult: success
        };
      }
      return updated;
    });
  }, []);

  // Helper to get player key by index
  const getPlayerKeyByIndex = (index: number): keyof Round | null => {
    switch (index) {
      case 0: return 'team1Player1';
      case 1: return 'team1Player2';
      case 2: return 'team2Player1';
      case 3: return 'team2Player2';
      default: return null;
    }
  };

  // Game action handlers
  const submitBids = useCallback(() => {
    // Validate bids
    const totalBids = 
      currentRound.team1Player1.bid + 
      currentRound.team1Player2.bid + 
      currentRound.team2Player1.bid + 
      currentRound.team2Player2.bid;
    
    if (totalBids > 13) {
      alert('Total bids cannot exceed 13 tricks');
      return;
    }
    
    setCurrentRound(prev => ({
      ...prev,
      biddingComplete: true
    }));
  }, [currentRound]);

  const submitTricks = useCallback(() => {
    // Validate tricks
    const totalTricks = 
      currentRound.team1Player1.tricks + 
      currentRound.team1Player2.tricks + 
      currentRound.team2Player1.tricks + 
      currentRound.team2Player2.tricks;
    
    if (totalTricks !== 13) {
      alert('Total tricks must equal 13');
      return;
    }
    
    // Calculate team tricks
    const team1Tricks = (currentRound.team1Player1.tricks || 0) + (currentRound.team1Player2.tricks || 0);
    const team2Tricks = (currentRound.team2Player1.tricks || 0) + (currentRound.team2Player2.tricks || 0);
    
    setCurrentRound(prev => ({
      ...prev,
      team1Tricks,
      team2Tricks,
      tricksComplete: true
    }));
  }, [currentRound]);

  const finalizeRound = useCallback(() => {
    // Ensure all Nello results have been submitted
    if (!allNelloResultsSubmitted()) {
      alert('Please confirm all Nello results before finalizing the round');
      return;
    }
    
    // Calculate final scores for the round
    const team1Players = [currentRound.team1Player1, currentRound.team1Player2];
    const team2Players = [currentRound.team2Player1, currentRound.team2Player2];
    
    // Calculate team1 score
    const team1YellowCards = isTournamentRules && currentRound.team1Tricks - team1Players.reduce((total, p) => total + (p.blindNil || p.bid === 0 ? 0 : p.bid), 0) >= 3 ? 1 : 0;
    const team1Result = calculateTeamScore(team1Players, currentRound.team1Tricks, team1Score, team1YellowCards, true);
    
    // Calculate team2 score
    const team2YellowCards = isTournamentRules && currentRound.team2Tricks - team2Players.reduce((total, p) => total + (p.blindNil || p.bid === 0 ? 0 : p.bid), 0) >= 3 ? 1 : 0;
    const team2Result = calculateTeamScore(team2Players, currentRound.team2Tricks, team2Score, team2YellowCards, true);
    
    // Update round with final calculations
    const finalizedRound: Round = {
      ...currentRound,
      team1Points: team1Result.scoreChange,
      team1Bags: team1Result.bagsChange,
      team1YellowCards,
      team2Points: team2Result.scoreChange,
      team2Bags: team2Result.bagsChange,
      team2YellowCards,
      roundComplete: true
    };
    
    // Add round to history
    setHistory(prev => [...prev, finalizedRound]);
    
    // Update team scores
    setTeam1Score(team1Result.newScore);
    setTeam2Score(team2Result.newScore);
    
    // Check for game end
    const winningScore = isShortGame ? 300 : 500;
    if (team1Result.newScore.score >= winningScore || team2Result.newScore.score >= winningScore) {
      const winner = team1Result.newScore.score > team2Result.newScore.score ? team1Score.name : team2Score.name;
      alert(`Game Over! ${winner} wins with ${Math.max(team1Result.newScore.score, team2Result.newScore.score)} points!`);
    }
    
    // Start a new round
    setCurrentRound({
      ...initialRoundState,
      team1Player1: { ...initialPlayerState, name: team1Score.player1Name },
      team1Player2: { ...initialPlayerState, name: team1Score.player2Name },
      team2Player1: { ...initialPlayerState, name: team2Score.player1Name },
      team2Player2: { ...initialPlayerState, name: team2Score.player2Name }
    });
  }, [
    currentRound, 
    team1Score, 
    team2Score, 
    isShortGame, 
    isTournamentRules, 
    calculateTeamScore, 
    allNelloResultsSubmitted
  ]);

  // Team and player name updates
  const updateTeamName = useCallback((team: 1 | 2, name: string) => {
    if (team === 1) {
      setTeam1Score(prev => ({ ...prev, name }));
    } else {
      setTeam2Score(prev => ({ ...prev, name }));
    }
  }, []);

  const updatePlayerName = useCallback((playerIndex: number, name: string) => {
    const playerKey = getPlayerKeyByIndex(playerIndex);
    if (!playerKey) return;
    
    // Update in current round
    setCurrentRound(prev => ({
      ...prev,
      [playerKey]: {
        ...prev[playerKey],
        name
      }
    }));
    
    // Update in team score
    if (playerIndex === 0) {
      setTeam1Score(prev => ({ ...prev, player1Name: name }));
    } else if (playerIndex === 1) {
      setTeam1Score(prev => ({ ...prev, player2Name: name }));
    } else if (playerIndex === 2) {
      setTeam2Score(prev => ({ ...prev, player1Name: name }));
    } else if (playerIndex === 3) {
      setTeam2Score(prev => ({ ...prev, player2Name: name }));
    }
  }, []);

  // History editing
  const handleHistoryEdit = useCallback((index: number, field: HistoryEditField, value: any) => {
    if (editingRound === null) return;
    
    setEditingRound(prev => {
      if (!prev) return null;
      
      const updated = { ...prev };
      
      // Parse the field to determine which part to update
      if (field.startsWith('team1_1_')) {
        const playerField = field.replace('team1_1_', '') as keyof Player;
        updated.team1Player1 = { 
          ...updated.team1Player1, 
          [playerField]: value 
        };
      } else if (field.startsWith('team1_2_')) {
        const playerField = field.replace('team1_2_', '') as keyof Player;
        updated.team1Player2 = { 
          ...updated.team1Player2, 
          [playerField]: value 
        };
      } else if (field.startsWith('team2_1_')) {
        const playerField = field.replace('team2_1_', '') as keyof Player;
        updated.team2Player1 = { 
          ...updated.team2Player1, 
          [playerField]: value 
        };
      } else if (field.startsWith('team2_2_')) {
        const playerField = field.replace('team2_2_', '') as keyof Player;
        updated.team2Player2 = { 
          ...updated.team2Player2, 
          [playerField]: value 
        };
      } else if (field === 'team1Tricks') {
        updated.team1Tricks = parseInt(value);
      } else if (field === 'team2Tricks') {
        updated.team2Tricks = parseInt(value);
      }
      
      return updated;
    });
  }, [editingRound]);

  const startHistoryEdit = useCallback((index: number) => {
    setEditingHistoryIndex(index);
    setEditingRound({ ...history[index] });
  }, [history]);

  const cancelHistoryEdit = useCallback(() => {
    setEditingHistoryIndex(null);
    setEditingRound(null);
  }, []);

  const saveHistoryEdit = useCallback(async () => {
    if (editingHistoryIndex === null || editingRound === null) return;
    
    // Recalculate the scores based on the edited round
    const team1Players = [editingRound.team1Player1, editingRound.team1Player2];
    const team2Players = [editingRound.team2Player1, editingRound.team2Player2];
    
    const team1YellowCards = isTournamentRules && editingRound.team1Tricks - team1Players.reduce((total, p) => total + (p.blindNil || p.bid === 0 ? 0 : p.bid), 0) >= 3 ? 1 : 0;
    const team2YellowCards = isTournamentRules && editingRound.team2Tricks - team2Players.reduce((total, p) => total + (p.blindNil || p.bid === 0 ? 0 : p.bid), 0) >= 3 ? 1 : 0;
    
    // Calculate score changes for this round
    const team1Result = calculateTeamScore(team1Players, editingRound.team1Tricks, team1Score, team1YellowCards, true);
    const team2Result = calculateTeamScore(team2Players, editingRound.team2Tricks, team2Score, team2YellowCards, true);
    
    // Create updated round
    const updatedRound: Round = {
      ...editingRound,
      team1Points: team1Result.scoreChange,
      team1Bags: team1Result.bagsChange,
      team1YellowCards,
      team2Points: team2Result.scoreChange,
      team2Bags: team2Result.bagsChange,
      team2YellowCards
    };
    
    // Update history
    setHistory(prev => {
      const updated = [...prev];
      updated[editingHistoryIndex] = updatedRound;
      return updated;
    });
    
    // Recalculate all cumulative scores
    let cumulativeTeam1Score = { ...initialTeamScoreState, name: team1Score.name, player1Name: team1Score.player1Name, player2Name: team1Score.player2Name };
    let cumulativeTeam2Score = { ...initialTeamScoreState, name: team2Score.name, player1Name: team2Score.player1Name, player2Name: team2Score.player2Name };
    
    // Apply all rounds to get final scores
    const updatedHistory = [...history];
    updatedHistory[editingHistoryIndex] = updatedRound;
    
    for (const round of updatedHistory) {
      const t1Players = [round.team1Player1, round.team1Player2];
      const t2Players = [round.team2Player1, round.team2Player2];
      
      const t1Result = calculateTeamScore(t1Players, round.team1Tricks, cumulativeTeam1Score, round.team1YellowCards, true);
      const t2Result = calculateTeamScore(t2Players, round.team2Tricks, cumulativeTeam2Score, round.team2YellowCards, true);
      
      cumulativeTeam1Score = t1Result.newScore;
      cumulativeTeam2Score = t2Result.newScore;
    }
    
    // Update team scores
    setTeam1Score(cumulativeTeam1Score);
    setTeam2Score(cumulativeTeam2Score);
    
    // Reset editing state
    setEditingHistoryIndex(null);
    setEditingRound(null);
  }, [
    editingHistoryIndex, 
    editingRound, 
    history, 
    isTournamentRules,
    team1Score, 
    team2Score, 
    calculateTeamScore
  ]);

  // Helper functions
  const calculateCumulativeBags = useCallback((roundIndex: number, team: 1 | 2) => {
    return history.slice(0, roundIndex + 1).reduce((total, round) => {
      return total + (team === 1 ? round.team1Bags : round.team2Bags);
    }, 0);
  }, [history]);

  const calculateCumulativeYellowCards = useCallback((roundIndex: number, team: 1 | 2) => {
    return history.slice(0, roundIndex + 1).reduce((total, round) => {
      return total + (team === 1 ? round.team1YellowCards : round.team2YellowCards);
    }, 0);
  }, [history]);

  const allNelloResultsSubmitted = useCallback(() => {
    const checkPlayer = (player: Player) => {
      if (player.bid === 0 || player.blindNil) {
        return player.nelloResult !== null;
      }
      return true;
    };
    
    return (
      checkPlayer(currentRound.team1Player1) &&
      checkPlayer(currentRound.team1Player2) &&
      checkPlayer(currentRound.team2Player1) &&
      checkPlayer(currentRound.team2Player2)
    );
  }, [currentRound]);

  const resetGame = useCallback(() => {
    const confirmReset = window.confirm('Are you sure you want to reset the game? This will keep player names but reset all scores and history.');
    
    if (confirmReset) {
      // Keep team and player names
      setTeam1Score(prev => ({
        ...initialTeamScoreState,
        name: prev.name,
        player1Name: prev.player1Name,
        player2Name: prev.player2Name
      }));
      
      setTeam2Score(prev => ({
        ...initialTeamScoreState,
        name: prev.name,
        player1Name: prev.player1Name,
        player2Name: prev.player2Name
      }));
      
      // Reset history and current round
      setHistory([]);
      setCurrentRound({
        ...initialRoundState,
        team1Player1: { ...initialPlayerState, name: team1Score.player1Name },
        team1Player2: { ...initialPlayerState, name: team1Score.player2Name },
        team2Player1: { ...initialPlayerState, name: team2Score.player1Name },
        team2Player2: { ...initialPlayerState, name: team2Score.player2Name }
      });
    }
  }, [team1Score, team2Score]);

  const resetEverything = useCallback(() => {
    const confirmReset = window.confirm('Are you sure you want to reset everything? This will delete all game data including player names.');
    
    if (confirmReset) {
      // Reset everything to initial values
      setTeam1Score({
        ...initialTeamScoreState,
        name: 'Team 1',
        player1Name: 'Player 1',
        player2Name: 'Player 2'
      });
      
      setTeam2Score({
        ...initialTeamScoreState,
        name: 'Team 2',
        player1Name: 'Player 3',
        player2Name: 'Player 4'
      });
      
      setHistory([]);
      setCurrentRound({
        ...initialRoundState,
        team1Player1: { ...initialPlayerState, name: 'Player 1' },
        team1Player2: { ...initialPlayerState, name: 'Player 2' },
        team2Player1: { ...initialPlayerState, name: 'Player 3' },
        team2Player2: { ...initialPlayerState, name: 'Player 4' }
      });
      
      setIsShortGame(false);
      setIsTournamentRules(false);
      setIsFinalsGame(false);
      setIsEditing(false);
      setShowRules(false);
    }
  }, []);

  const calculatePreviewScores = useCallback(() => {
    if (!currentRound.tricksComplete) {
      setPreviewScores({
        team1: { ...team1Score },
        team2: { ...team2Score }
      });
      return;
    }
    
    // Calculate preview scores based on current round
    const team1Players = [currentRound.team1Player1, currentRound.team1Player2];
    const team2Players = [currentRound.team2Player1, currentRound.team2Player2];
    
    const team1YellowCards = isTournamentRules && currentRound.team1Tricks - team1Players.reduce((total, p) => total + (p.blindNil || p.bid === 0 ? 0 : p.bid), 0) >= 3 ? 1 : 0;
    const team2YellowCards = isTournamentRules && currentRound.team2Tricks - team2Players.reduce((total, p) => total + (p.blindNil || p.bid === 0 ? 0 : p.bid), 0) >= 3 ? 1 : 0;
    
    const team1Result = calculateTeamScore(team1Players, currentRound.team1Tricks, team1Score, team1YellowCards, true);
    const team2Result = calculateTeamScore(team2Players, currentRound.team2Tricks, team2Score, team2YellowCards, true);
    
    setPreviewScores({
      team1: team1Result.newScore,
      team2: team2Result.newScore
    });
  }, [currentRound, team1Score, team2Score, isTournamentRules, calculateTeamScore]);

  // Get game state for components
  const getTeam1Players = useCallback(() => {
    return [currentRound.team1Player1, currentRound.team1Player2];
  }, [currentRound]);

  const getTeam2Players = useCallback(() => {
    return [currentRound.team2Player1, currentRound.team2Player2];
  }, [currentRound]);

  return {
    // State
    team1Score,
    team2Score,
    history,
    currentRound,
    isShortGame,
    isTournamentRules,
    isFinalsGame,
    isEditing,
    showRules,
    editingHistoryIndex,
    editingRound,
    previewScores,
    
    // State setters
    setIsShortGame,
    setIsTournamentRules,
    setIsFinalsGame,
    setIsEditing,
    setShowRules,
    
    // Game rules
    getGameRules,
    
    // Player input handlers
    updateBid,
    updateBlindNil,
    updateTricks,
    updateNelloResult,
    
    // Team and player name handlers
    updateTeamName,
    updatePlayerName,
    
    // Game action handlers
    submitBids,
    submitTricks,
    finalizeRound,
    resetGame,
    resetEverything,
    
    // History editing
    handleHistoryEdit,
    startHistoryEdit,
    cancelHistoryEdit,
    saveHistoryEdit,
    
    // Helper functions
    allNelloResultsSubmitted,
    calculateCumulativeBags,
    calculateCumulativeYellowCards,
    
    // Accessor functions
    getTeam1Players,
    getTeam2Players
  };
} 