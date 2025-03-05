export interface Player {
  name: string;
  bid: number;
  tricks: number | null;
  blindNil: boolean;
  nelloResult: boolean | null;
}

export interface TeamScore {
  name: string;
  score: number;
  bags: number;
  consecutiveSuccessfulNellos: number;
  yellowCards: number;
}

export interface Round {
  // Player data
  team1Player1: Player;
  team1Player2: Player;
  team2Player1: Player;
  team2Player2: Player;
  
  // Team data
  team1Tricks: number;
  team2Tricks: number;
  
  // Scoring results
  team1Points: number;
  team1Bags: number;
  team1YellowCards: number;
  team2Points: number;
  team2Bags: number;
  team2YellowCards: number;
  
  // Round state
  biddingComplete: boolean;
  tricksComplete: boolean;
  nelloResultsComplete: boolean;
  roundComplete: boolean;
}

export interface GameState {
  // Team scores
  team1Score: TeamScore;
  team2Score: TeamScore;
  
  // Game history
  history: Round[];
  
  // Current round
  currentRound: Round;
  
  // Game options
  isShortGame: boolean;
  isTournamentRules: boolean;
  isFinalsGame: boolean;
  
  // UI state
  isEditing: boolean;
  showRules: boolean;
}

export type HistoryEditField = 
  | 'team1_1_bid' 
  | 'team1_1_isNello' 
  | 'team1_1_isBlindNello'
  | 'team1_1_nelloSuccess'
  | 'team1_2_bid'
  | 'team1_2_isNello'
  | 'team1_2_isBlindNello'
  | 'team1_2_nelloSuccess'
  | 'team2_1_bid'
  | 'team2_1_isNello'
  | 'team2_1_isBlindNello'
  | 'team2_1_nelloSuccess'
  | 'team2_2_bid'
  | 'team2_2_isNello'
  | 'team2_2_isBlindNello'
  | 'team2_2_nelloSuccess'
  | 'team1Tricks'
  | 'team2Tricks';

// Initial state values
export const initialPlayerState: Player = {
  name: '',
  bid: 0,
  tricks: null,
  blindNil: false,
  nelloResult: null
};

export const initialTeamScoreState: TeamScore = {
  name: '',
  score: 0,
  bags: 0,
  consecutiveSuccessfulNellos: 0,
  yellowCards: 0
};

export const initialRoundState: Round = {
  team1Player1: { ...initialPlayerState, name: 'Player 1' },
  team1Player2: { ...initialPlayerState, name: 'Player 2' },
  team2Player1: { ...initialPlayerState, name: 'Player 3' },
  team2Player2: { ...initialPlayerState, name: 'Player 4' },
  team1Tricks: 0,
  team2Tricks: 0,
  team1Points: 0,
  team1Bags: 0,
  team1YellowCards: 0,
  team2Points: 0,
  team2Bags: 0,
  team2YellowCards: 0,
  biddingComplete: false,
  tricksComplete: false,
  nelloResultsComplete: false,
  roundComplete: false
}; 