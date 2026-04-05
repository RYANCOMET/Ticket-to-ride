import { routesData } from "./data/routes-data.js";
import { stationsData } from "./data/stations-data.js";
import { state } from "./state.js";
import { initAccordions } from "./ui/accordions.js";
import { createGameController } from "./game/game-controller.js";
import {
  syncMobileSidebarMode,
  applySidebarState,
  toggleSidebar
} from "./ui/sidebars.js";   
import { buildStations } from "./map/stations.js";
import { buildRoutes } from "./map/routes.js";
import { registerRouteGroups, fitToData } from "./map/setup.js";

import {
  renderOffer as renderOfferModule,
  renderHand as renderHandModule,
  updateDrawControls as updateDrawControlsModule,
  ets as etsModule,
  keepSelectedTickets as keepSelectedTicketsModule
} from "./game/tickets.js";

import {
  connectionPointsForLength as connectionPointsForLengthModule,
  isRouteComplete as isRouteCompleteModule,
  getCompletedRouteKeys as getCompletedRouteKeysModule,
  buildClaimedGraph as buildClaimedGraphModule,
  areCitiesConnected as areCitiesConnectedModule,
  computeScores as computeScoresModule,
  getIncompleteTickets as getIncompleteTicketsModule,
  getHighlightedStationNames as getHighlightedStationNamesModule,
  getGuideDestinationsForStation as getGuideDestinationsForStationModule
} from "./game/scoring.js";

import {
  clearStationGuides as clearStationGuidesModule,
  drawStationGuidesFrom as drawStationGuidesFromModule,
  handleStationClick as handleStationClickModule,
  updateStationStyles as updateStationStylesModule
} from "./map/station-guides.js";

import {
  getTrainCardTypeLabel as getTrainCardTypeLabelModule,
  createEmptyTrainCarCounts as createEmptyTrainCarCountsModule,
  computeSpentTrainCarCounts as computeSpentTrainCarCountsModule,
  computeAvailableTrainCarCounts as computeAvailableTrainCarCountsModule,
  chooseGreyRouteSpendPlan as chooseGreyRouteSpendPlanModule,
  getRouteClaimOffer as getRouteClaimOfferModule,
  describeSpendPlan as describeSpendPlanModule
} from "./game/route-claims.js";

import {
  formatChallengeReward as formatChallengeRewardModule,
  randomTrainCardKey as randomTrainCardKeyModule,
  getChallengePool as getChallengePoolModule,
  createChallengeForType as createChallengeForTypeModule,
  createTrainCard as createTrainCardModule,
  sanitizeTrainCard as sanitizeTrainCardModule,
  countRainbowCards as countRainbowCardsModule,
  dealFreshVisibleTrainCards as dealFreshVisibleTrainCardsModule,
  normalizeVisibleTrainCards as normalizeVisibleTrainCardsModule,
  normalizeTrainHandCards as normalizeTrainHandCardsModule,
  normalizeCompletedChallengeCards as normalizeCompletedChallengeCardsModule,
  reshuffleVisibleTrainCardsIfNeeded as reshuffleVisibleTrainCardsIfNeededModule,
  getPreviewTrainCard as getPreviewTrainCardModule,
  computeTrainCarStoreCounts as computeTrainCarStoreCountsModule,
  setTrainCardTrayOpen as setTrainCardTrayOpenModule,
  openTrainCardTray as openTrainCardTrayModule,
  closeTrainCardTray as closeTrainCardTrayModule,
  toggleTrainCardTray as toggleTrainCardTrayModule,
  renderVisibleTrainCards as renderVisibleTrainCardsModule,
  renderActiveChallengeCard as renderActiveChallengeCardModule,
  renderTrainHand as renderTrainHandModule,
  renderCompletedChallenges as renderCompletedChallengesModule,
  previewVisibleTrainCard as previewVisibleTrainCardModule,
  clearPreviewedChallenge as clearPreviewedChallengeModule,
  claimPreviewedChallenge as claimPreviewedChallengeModule,
  completeActiveChallenge as completeActiveChallengeModule
} from "./game/train-cards.js";

const SUPABASE_URL = 'https://iloeoccqvxwwlmgbbweu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb2VvY2Nxdnh3d2xtZ2Jid2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzg3NDIsImV4cCI6MjA5MDY1NDc0Mn0.PseTgg81ZTeeIohlILmgHLNx31KlzphubwVi6strXPw';
const GAME_ID = 'europe-main';
const GAME_NAME = 'Europe Main Game';
const ROUTE_POINT_VALUES = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10, 6: 15 };
const ALL_TICKETS = [{"start": "Brussels", "end": "Ghent", "points": 5}, {"start": "Chamonix", "end": "Geneva", "points": 5}, {"start": "Divača", "end": "Ljubljana", "points": 5}, {"start": "Gothenburg", "end": "Skagen", "points": 5}, {"start": "Graz", "end": "Johnsbach im Nationalpark Bahnhst", "points": 5}, {"start": "Grephso", "end": "Skopje", "points": 5}, {"start": "Helsinki", "end": "Rakvere", "points": 5}, {"start": "Helsinki", "end": "Tallin", "points": 5}, {"start": "Hospental", "end": "Milan", "points": 5}, {"start": "Keszthely", "end": "Zagreb", "points": 5}, {"start": "Klaipeda Giruliai Train Station", "end": "Šiauliai", "points": 5}, {"start": "Ligatne", "end": "Mägiste", "points": 5}, {"start": "Ligatne", "end": "Riga", "points": 5}, {"start": "Niš", "end": "Rudnica", "points": 5}, {"start": "Podgorica", "end": "Rudnica", "points": 5}, {"start": "Podgorica", "end": "Sutomore", "points": 5}, {"start": "Poiana Ilvei", "end": "Sighișoara", "points": 5}, {"start": "Prague", "end": "Český Krumlov", "points": 5}, {"start": "Abisko", "end": "Kolari", "points": 5}, {"start": "Bad Schandau", "end": "Blankso", "points": 5}, {"start": "Bansko", "end": "Skopje", "points": 5}, {"start": "Barcelona", "end": "Tournay", "points": 5}, {"start": "Blankso", "end": "Prague", "points": 5}, {"start": "Brussels", "end": "Kautenbach", "points": 5}, {"start": "Bucharest", "end": "Sofia", "points": 6}, {"start": "Budapest", "end": "Tiszalúc", "points": 6}, {"start": "Burgas", "end": "Istanbul", "points": 6}, {"start": "Copenhagen", "end": "Viborg", "points": 6}, {"start": "Daugavpils", "end": "Ligatne", "points": 6}, {"start": "Faro", "end": "Lisbon", "points": 6}, {"start": "Ghent", "end": "Paris", "points": 6}, {"start": "Gothenburg", "end": "Oslo", "points": 6}, {"start": "Gothenburg", "end": "Örebro", "points": 6}, {"start": "Innsbruck", "end": "Rothenburg ob der Tauber", "points": 6}, {"start": "Kayseri", "end": "Ladik", "points": 6}, {"start": "Klaipeda Giruliai Train Station", "end": "Vilnius", "points": 6}, {"start": "Oslo", "end": "Skagen", "points": 6}, {"start": "Oslo", "end": "Örebro", "points": 6}, {"start": "Pinhão", "end": "Plasencia", "points": 6}, {"start": "Vilnius", "end": "Šiauliai", "points": 6}, {"start": "Mägiste", "end": "Riga", "points": 6}, {"start": "Niš", "end": "Podgorica", "points": 6}, {"start": "Ohrid", "end": "Skopje", "points": 6}, {"start": "Rakvere", "end": "Tallin", "points": 6}, {"start": "Rudnica", "end": "Sutomore", "points": 6}, {"start": "Tatranská Lomnica", "end": "Tiszalúc", "points": 6}, {"start": "Bad Schandau", "end": "Hamburg", "points": 6}, {"start": "Faro", "end": "Plasencia", "points": 6}, {"start": "Flåmsbana", "end": "Trondheim", "points": 6}, {"start": "Helsinki", "end": "Kuopio", "points": 7}, {"start": "Hospental", "end": "Luxembourg", "points": 7}, {"start": "Istanbul", "end": "Ladik", "points": 7}, {"start": "La Caridad", "end": "Tournay", "points": 7}, {"start": "Lisbon", "end": "Pinhão", "points": 7}, {"start": "Lisbon", "end": "Plasencia", "points": 7}, {"start": "Amsterdam", "end": "Dinant", "points": 7}, {"start": "Daugavpils", "end": "Mägiste", "points": 7}, {"start": "Divača", "end": "Innsbruck", "points": 7}, {"start": "Grephso", "end": "Sofia", "points": 7}, {"start": "Ohrid", "end": "Sofia", "points": 7}, {"start": "Riga", "end": "Vilnius", "points": 7}, {"start": "Skagen", "end": "Örebro", "points": 7}, {"start": "Niš", "end": "Sutomore", "points": 7}, {"start": "'t Harde", "end": "Kautenbach", "points": 7}, {"start": "Copenhagen", "end": "Groningen", "points": 7}, {"start": "Klaipeda Giruliai Train Station", "end": "Warsaw", "points": 7}, {"start": "Malbork", "end": "Zackopane", "points": 7}, {"start": "Tatranská Lomnica", "end": "Český Krumlov", "points": 7}, {"start": "Chamonix", "end": "Tournay", "points": 7}, {"start": "Kuopio", "end": "Rakvere", "points": 7}, {"start": "Kuopio", "end": "Tallin", "points": 7}, {"start": "Luxembourg", "end": "Milan", "points": 7}, {"start": "Abisko", "end": "Trondheim", "points": 7}, {"start": "Istanbul", "end": "Kayseri", "points": 7}, {"start": "'t Harde", "end": "Dinant", "points": 8}, {"start": "Belgrade", "end": "Trpanj", "points": 8}, {"start": "Brat is Lava", "end": "Ljubljana", "points": 8}, {"start": "Brat is Lava", "end": "Spisske Vlachy", "points": 8}, {"start": "Divača", "end": "Sarajevo", "points": 8}, {"start": "Bansko", "end": "Messina Centrale", "points": 8}, {"start": "Barcelona", "end": "La Caridad", "points": 8}, {"start": "Belgrade", "end": "Tiszalúc", "points": 8}, {"start": "Budapest", "end": "Sarajevo", "points": 8}, {"start": "Burgas", "end": "Ladik", "points": 8}, {"start": "Faro", "end": "Pinhão", "points": 8}, {"start": "Warsaw", "end": "Šiauliai", "points": 8}, {"start": "Amsterdam", "end": "Copenhagen", "points": 8}, {"start": "Blankso", "end": "Ljubljana", "points": 8}, {"start": "Johnsbach im Nationalpark Bahnhst", "end": "Sarajevo", "points": 8}, {"start": "Milan", "end": "Pula", "points": 8}, {"start": "Brat is Lava", "end": "Most na Soči", "points": 8}, {"start": "Groningen", "end": "Luxembourg", "points": 8}, {"start": "Innsbruck", "end": "Keszthely", "points": 8}, {"start": "Prague", "end": "Zagreb", "points": 8}, {"start": "Bad Schandau", "end": "Zackopane", "points": 8}, {"start": "Budapest", "end": "Mostar", "points": 8}, {"start": "Johnsbach im Nationalpark Bahnhst", "end": "Trpanj", "points": 8}, {"start": "Poiana Ilvei", "end": "Warsaw", "points": 8}, {"start": "Barcelona", "end": "Paris", "points": 8}, {"start": "Bucharest", "end": "Kayseri", "points": 9}, {"start": "Kolari", "end": "Trondheim", "points": 9}, {"start": "Brat is Lava", "end": "Mostar", "points": 9}, {"start": "Graz", "end": "Tatranská Lomnica", "points": 9}, {"start": "Chamonix", "end": "Dinant", "points": 9}, {"start": "Geneva", "end": "Kautenbach", "points": 9}, {"start": "Pula", "end": "Trpanj", "points": 9}, {"start": "Calenella", "end": "Geneva", "points": 9}, {"start": "Hamburg", "end": "Most na Soči", "points": 9}, {"start": "Messina Centrale", "end": "Mostar", "points": 9}, {"start": "Zackopane", "end": "Český Krumlov", "points": 9}, {"start": "Calenella", "end": "Grephso", "points": 9}, {"start": "Abisko", "end": "Flåmsbana", "points": 9}, {"start": "La Caridad", "end": "Paris", "points": 9}, {"start": "Belgrade", "end": "Pula", "points": 9}, {"start": "Keszthely", "end": "Rothenburg ob der Tauber", "points": 9}, {"start": "Bansko", "end": "Calenella", "points": 9}, {"start": "Brussels", "end": "Viborg", "points": 9}, {"start": "Bucharest", "end": "Messina Centrale", "points": 9}, {"start": "Ghent", "end": "Viborg", "points": 9}, {"start": "Graz", "end": "Sighișoara", "points": 9}, {"start": "Malbork", "end": "Poiana Ilvei", "points": 9}, {"start": "Ohrid", "end": "Zermat", "points": 9}, {"start": "Amsterdam", "end": "Zermat", "points": 9}, {"start": "Groningen", "end": "Hospental", "points": 9}, {"start": "Burgas", "end": "Mostar", "points": 10}, {"start": "Most na Soči", "end": "Spisske Vlachy", "points": 10}, {"start": "Daugavpils", "end": "Spisske Vlachy", "points": 10}, {"start": "Flåmsbana", "end": "Kolari", "points": 10}, {"start": "'t Harde", "end": "Zermat", "points": 10}, {"start": "Hamburg", "end": "Zagreb", "points": 10}, {"start": "Malbork", "end": "Sighișoara", "points": 10}, {"start": "Budapest", "end": "Rothenburg ob der Tauber", "points": 10}, {"start": "Calenella", "end": "Rudnica", "points": 10}, {"start": "Calenella", "end": "Pula", "points": 10}, {"start": "Calenella", "end": "Tournay", "points": 10}, {"start": "Messina Centrale", "end": "Tournay", "points": 10}, {"start": "Messina Centrale", "end": "Zagreb", "points": 10}, {"start": "Flåmsbana", "end": "Groningen", "points": 10}, {"start": "Gothenburg", "end": "Tatranská Lomnica", "points": 10}, {"start": "Amsterdam", "end": "Geneva", "points": 10}, {"start": "Graz", "end": "Groningen", "points": 10}, {"start": "Abisko", "end": "Ligatne", "points": 10}, {"start": "Daugavpils", "end": "Kolari", "points": 10}, {"start": "Ladik", "end": "Podgorica", "points": 10}, {"start": "Bucharest", "end": "Graz", "points": 10}, {"start": "Mostar", "end": "Poiana Ilvei", "points": 10}, {"start": "Niš", "end": "Český Krumlov", "points": 10}, {"start": "Poiana Ilvei", "end": "Trpanj", "points": 10}, {"start": "Kayseri", "end": "Skopje", "points": 11}, {"start": "Plasencia", "end": "Zermat", "points": 11}, {"start": "Pula", "end": "Spisske Vlachy", "points": 11}, {"start": "Bucharest", "end": "Český Krumlov", "points": 11}, {"start": "Chamonix", "end": "Trpanj", "points": 11}, {"start": "Faro", "end": "Ghent", "points": 11}, {"start": "Kolari", "end": "Šiauliai", "points": 11}, {"start": "'t Harde", "end": "Geneva", "points": 11}, {"start": "Divača", "end": "Sighișoara", "points": 11}, {"start": "Mägiste", "end": "Prague", "points": 11}, {"start": "Budapest", "end": "Istanbul", "points": 11}, {"start": "Istanbul", "end": "Mostar", "points": 11}, {"start": "Blankso", "end": "Kautenbach", "points": 11}, {"start": "Kautenbach", "end": "Warsaw", "points": 11}, {"start": "Rothenburg ob der Tauber", "end": "Trondheim", "points": 11}, {"start": "Bansko", "end": "Most na Soči", "points": 11}, {"start": "Pula", "end": "Sofia", "points": 11}, {"start": "'t Harde", "end": "Budapest", "points": 11}, {"start": "Brat is Lava", "end": "Luxembourg", "points": 11}, {"start": "Dinant", "end": "Warsaw", "points": 11}, {"start": "Divača", "end": "Viborg", "points": 11}, {"start": "Keszthely", "end": "Viborg", "points": 11}, {"start": "Ligatne", "end": "Spisske Vlachy", "points": 11}, {"start": "Niš", "end": "Zackopane", "points": 11}, {"start": "Abisko", "end": "Viborg", "points": 11}, {"start": "Chamonix", "end": "Sutomore", "points": 12}, {"start": "Dinant", "end": "Pinhão", "points": 12}, {"start": "Bad Schandau", "end": "Zermat", "points": 12}, {"start": "Abisko", "end": "Riga", "points": 12}, {"start": "Bad Schandau", "end": "Podgorica", "points": 12}, {"start": "Brat is Lava", "end": "Ghent", "points": 12}, {"start": "Keszthely", "end": "Šiauliai", "points": 12}, {"start": "Hospental", "end": "Plasencia", "points": 12}, {"start": "Ladik", "end": "Sarajevo", "points": 12}, {"start": "Luxembourg", "end": "Ohrid", "points": 12}, {"start": "Dinant", "end": "Český Krumlov", "points": 12}, {"start": "Sutomore", "end": "Tatranská Lomnica", "points": 12}, {"start": "Brussels", "end": "Johnsbach im Nationalpark Bahnhst", "points": 12}, {"start": "Lisbon", "end": "Milan", "points": 12}, {"start": "Faro", "end": "Kautenbach", "points": 12}, {"start": "Malbork", "end": "Oslo", "points": 12}, {"start": "Most na Soči", "end": "Örebro", "points": 12}, {"start": "Klaipeda Giruliai Train Station", "end": "Most na Soči", "points": 12}, {"start": "Kuopio", "end": "Malbork", "points": 12}, {"start": "Kayseri", "end": "Podgorica", "points": 12}, {"start": "Budapest", "end": "Riga", "points": 12}, {"start": "Burgas", "end": "Milan", "points": 12}, {"start": "Kuopio", "end": "Oslo", "points": 12}, {"start": "Blankso", "end": "Istanbul", "points": 12}, {"start": "Burgas", "end": "Ljubljana", "points": 12}, {"start": "Paris", "end": "Sarajevo", "points": 13}, {"start": "Amsterdam", "end": "Šiauliai", "points": 13}, {"start": "Mägiste", "end": "Spisske Vlachy", "points": 13}, {"start": "Bad Schandau", "end": "Grephso", "points": 13}, {"start": "Brat is Lava", "end": "Mägiste", "points": 13}, {"start": "Grephso", "end": "Prague", "points": 13}, {"start": "Malbork", "end": "Mostar", "points": 13}, {"start": "Innsbruck", "end": "Vilnius", "points": 13}, {"start": "Bansko", "end": "Innsbruck", "points": 13}, {"start": "Helsinki", "end": "Zackopane", "points": 13}, {"start": "Ohrid", "end": "Prague", "points": 13}, {"start": "Geneva", "end": "Sofia", "points": 13}, {"start": "Flåmsbana", "end": "Ghent", "points": 13}, {"start": "Belgrade", "end": "Klaipeda Giruliai Train Station", "points": 13}, {"start": "Copenhagen", "end": "Ligatne", "points": 13}, {"start": "Ljubljana", "end": "Skagen", "points": 13}, {"start": "Ljubljana", "end": "Örebro", "points": 13}, {"start": "Malbork", "end": "Niš", "points": 13}, {"start": "Blankso", "end": "Tallin", "points": 13}, {"start": "Skopje", "end": "Warsaw", "points": 13}, {"start": "Belgrade", "end": "Vilnius", "points": 13}, {"start": "Ladik", "end": "Zagreb", "points": 13}, {"start": "Burgas", "end": "Hospental", "points": 13}, {"start": "Helsinki", "end": "Oslo", "points": 13}, {"start": "Rothenburg ob der Tauber", "end": "Skopje", "points": 13}, {"start": "Hamburg", "end": "Rakvere", "points": 14}, {"start": "Helsinki", "end": "Tatranská Lomnica", "points": 14}, {"start": "Bucharest", "end": "Zermat", "points": 14}, {"start": "Innsbruck", "end": "Lisbon", "points": 14}, {"start": "Gothenburg", "end": "Riga", "points": 14}, {"start": "Graz", "end": "La Caridad", "points": 14}, {"start": "Barcelona", "end": "Ohrid", "points": 14}, {"start": "Faro", "end": "Messina Centrale", "points": 14}, {"start": "Brussels", "end": "Sighișoara", "points": 14}, {"start": "Sighișoara", "end": "Skagen", "points": 14}, {"start": "Amsterdam", "end": "Plasencia", "points": 14}, {"start": "Hamburg", "end": "Kolari", "points": 14}, {"start": "Barcelona", "end": "Sarajevo", "points": 14}, {"start": "Bansko", "end": "Hamburg", "points": 14}, {"start": "Zagreb", "end": "Örebro", "points": 14}, {"start": "'t Harde", "end": "Pinhão", "points": 14}, {"start": "Kayseri", "end": "Zackopane", "points": 14}, {"start": "Lisbon", "end": "Rothenburg ob der Tauber", "points": 14}, {"start": "Chamonix", "end": "Poiana Ilvei", "points": 14}, {"start": "Divača", "end": "Pinhão", "points": 14}, {"start": "Johnsbach im Nationalpark Bahnhst", "end": "La Caridad", "points": 14}, {"start": "Grephso", "end": "Paris", "points": 14}, {"start": "Luxembourg", "end": "Sofia", "points": 14}, {"start": "Sutomore", "end": "Tournay", "points": 14}, {"start": "Oslo", "end": "Tallin", "points": 14}, {"start": "Rakvere", "end": "Örebro", "points": 15}, {"start": "Brussels", "end": "Daugavpils", "points": 15}, {"start": "Daugavpils", "end": "Skagen", "points": 15}, {"start": "Hospental", "end": "Vilnius", "points": 15}, {"start": "Paris", "end": "Trondheim", "points": 15}, {"start": "Klaipeda Giruliai Train Station", "end": "Milan", "points": 15}, {"start": "Rakvere", "end": "Tiszalúc", "points": 15}, {"start": "Belgrade", "end": "Gothenburg", "points": 15}, {"start": "Copenhagen", "end": "Rudnica", "points": 15}, {"start": "Flåmsbana", "end": "Tiszalúc", "points": 15}, {"start": "Groningen", "end": "Rudnica", "points": 15}, {"start": "Tiszalúc", "end": "Trondheim", "points": 15}, {"start": "Copenhagen", "end": "Kuopio", "points": 15}, {"start": "Johnsbach im Nationalpark Bahnhst", "end": "Tallin", "points": 15}, {"start": "Keszthely", "end": "La Caridad", "points": 15}, {"start": "Barcelona", "end": "Trpanj", "points": 15}, {"start": "Belgrade", "end": "Brussels", "points": 15}, {"start": "Gothenburg", "end": "Sarajevo", "points": 15}, {"start": "Istanbul", "end": "Johnsbach im Nationalpark Bahnhst", "points": 15}, {"start": "Kautenbach", "end": "Niš", "points": 15}, {"start": "Kautenbach", "end": "Rudnica", "points": 15}, {"start": "Oslo", "end": "Pula", "points": 15}, {"start": "Oslo", "end": "Zagreb", "points": 15}, {"start": "'t Harde", "end": "Trpanj", "points": 15}, {"start": "Calenella", "end": "Zackopane", "points": 16}, {"start": "Hamburg", "end": "Ladik", "points": 16}, {"start": "Hamburg", "end": "Ohrid", "points": 16}, {"start": "Messina Centrale", "end": "Zackopane", "points": 16}, {"start": "Geneva", "end": "Malbork", "points": 16}, {"start": "Barcelona", "end": "Budapest", "points": 16}, {"start": "Burgas", "end": "Innsbruck", "points": 16}, {"start": "Dinant", "end": "Niš", "points": 16}, {"start": "Dinant", "end": "Rudnica", "points": 16}, {"start": "Istanbul", "end": "Most na Soči", "points": 16}, {"start": "'t Harde", "end": "Mostar", "points": 16}, {"start": "Amsterdam", "end": "Trpanj", "points": 16}, {"start": "Chamonix", "end": "Sighișoara", "points": 16}, {"start": "Grephso", "end": "Hamburg", "points": 16}, {"start": "Grephso", "end": "Malbork", "points": 16}, {"start": "Tallin", "end": "Tiszalúc", "points": 16}, {"start": "Calenella", "end": "Tatranská Lomnica", "points": 16}, {"start": "Johnsbach im Nationalpark Bahnhst", "end": "Ladik", "points": 16}, {"start": "Daugavpils", "end": "Oslo", "points": 16}, {"start": "Amsterdam", "end": "Mostar", "points": 16}, {"start": "Keszthely", "end": "Rakvere", "points": 16}, {"start": "Mägiste", "end": "Zagreb", "points": 16}, {"start": "Divača", "end": "Ladik", "points": 16}, {"start": "Graz", "end": "Trondheim", "points": 16}, {"start": "Milan", "end": "Vilnius", "points": 16}, {"start": "Pinhão", "end": "Zagreb", "points": 17}, {"start": "Bansko", "end": "Ghent", "points": 17}, {"start": "Brussels", "end": "Grephso", "points": 17}, {"start": "Paris", "end": "Skopje", "points": 17}, {"start": "Mägiste", "end": "Örebro", "points": 17}, {"start": "Divača", "end": "Flåmsbana", "points": 17}, {"start": "Flåmsbana", "end": "Keszthely", "points": 17}, {"start": "Flåmsbana", "end": "Ljubljana", "points": 17}, {"start": "'t Harde", "end": "Sofia", "points": 17}, {"start": "Belgrade", "end": "Skagen", "points": 17}, {"start": "Belgrade", "end": "Örebro", "points": 17}, {"start": "Bucharest", "end": "Luxembourg", "points": 17}, {"start": "Burgas", "end": "Rothenburg ob der Tauber", "points": 17}, {"start": "Hospental", "end": "Šiauliai", "points": 17}, {"start": "Innsbruck", "end": "Ligatne", "points": 17}, {"start": "Keszthely", "end": "Trondheim", "points": 17}, {"start": "Ligatne", "end": "Luxembourg", "points": 17}, {"start": "Ljubljana", "end": "Trondheim", "points": 17}, {"start": "Paris", "end": "Sighișoara", "points": 17}, {"start": "Sofia", "end": "Viborg", "points": 17}, {"start": "Vilnius", "end": "Zermat", "points": 17}, {"start": "Tournay", "end": "Warsaw", "points": 17}, {"start": "Ghent", "end": "Podgorica", "points": 17}, {"start": "Daugavpils", "end": "Pula", "points": 17}, {"start": "Geneva", "end": "Sighișoara", "points": 17}, {"start": "Helsinki", "end": "Tiszalúc", "points": 18}, {"start": "Klaipeda Giruliai Train Station", "end": "Zermat", "points": 18}, {"start": "Milan", "end": "Šiauliai", "points": 18}, {"start": "Tiszalúc", "end": "Tournay", "points": 18}, {"start": "Barcelona", "end": "Blankso", "points": 18}, {"start": "Calenella", "end": "Spisske Vlachy", "points": 18}, {"start": "Amsterdam", "end": "Rudnica", "points": 18}, {"start": "Bansko", "end": "Copenhagen", "points": 18}, {"start": "Bansko", "end": "Groningen", "points": 18}, {"start": "Copenhagen", "end": "Skopje", "points": 18}, {"start": "Gothenburg", "end": "Trpanj", "points": 18}, {"start": "Groningen", "end": "Skopje", "points": 18}, {"start": "Sarajevo", "end": "Skagen", "points": 18}, {"start": "Sarajevo", "end": "Örebro", "points": 18}, {"start": "Abisko", "end": "Prague", "points": 18}, {"start": "Burgas", "end": "Luxembourg", "points": 18}, {"start": "Divača", "end": "Mägiste", "points": 18}, {"start": "Graz", "end": "Tallin", "points": 18}, {"start": "Ligatne", "end": "Pula", "points": 18}, {"start": "Ljubljana", "end": "Rakvere", "points": 18}, {"start": "Brussels", "end": "Sutomore", "points": 18}, {"start": "Copenhagen", "end": "Sutomore", "points": 18}, {"start": "Gothenburg", "end": "Mostar", "points": 18}, {"start": "Groningen", "end": "Podgorica", "points": 18}, {"start": "Malbork", "end": "Ohrid", "points": 18}, {"start": "Kayseri", "end": "Prague", "points": 19}, {"start": "Kayseri", "end": "Český Krumlov", "points": 19}, {"start": "Paris", "end": "Sofia", "points": 19}, {"start": "Bad Schandau", "end": "Barcelona", "points": 19}, {"start": "Daugavpils", "end": "Hospental", "points": 19}, {"start": "Hospental", "end": "Riga", "points": 19}, {"start": "Ghent", "end": "Niš", "points": 19}, {"start": "Chamonix", "end": "Klaipeda Giruliai Train Station", "points": 19}, {"start": "Milan", "end": "Riga", "points": 19}, {"start": "Tatranská Lomnica", "end": "Tournay", "points": 19}, {"start": "Graz", "end": "Helsinki", "points": 19}, {"start": "Bucharest", "end": "Kautenbach", "points": 19}, {"start": "Budapest", "end": "La Caridad", "points": 19}, {"start": "Bucharest", "end": "Dinant", "points": 19}, {"start": "Chamonix", "end": "Vilnius", "points": 19}, {"start": "Bad Schandau", "end": "La Caridad", "points": 19}, {"start": "Messina Centrale", "end": "Skagen", "points": 19}, {"start": "Geneva", "end": "Klaipeda Giruliai Train Station", "points": 19}, {"start": "Kuopio", "end": "Český Krumlov", "points": 19}, {"start": "Zermat", "end": "Šiauliai", "points": 19}, {"start": "Innsbruck", "end": "Istanbul", "points": 19}, {"start": "Messina Centrale", "end": "Warsaw", "points": 19}, {"start": "Podgorica", "end": "Viborg", "points": 19}, {"start": "Sutomore", "end": "Viborg", "points": 19}, {"start": "Johnsbach im Nationalpark Bahnhst", "end": "Kayseri", "points": 19}, {"start": "Most na Soči", "end": "Rakvere", "points": 20}, {"start": "Blankso", "end": "La Caridad", "points": 20}, {"start": "Helsinki", "end": "Rothenburg ob der Tauber", "points": 20}, {"start": "Kuopio", "end": "Spisske Vlachy", "points": 20}, {"start": "Istanbul", "end": "Rothenburg ob der Tauber", "points": 20}, {"start": "Kolari", "end": "Tatranská Lomnica", "points": 20}, {"start": "Abisko", "end": "Brat is Lava", "points": 20}, {"start": "Most na Soči", "end": "Tallin", "points": 20}, {"start": "Budapest", "end": "Faro", "points": 20}, {"start": "Bad Schandau", "end": "Faro", "points": 20}, {"start": "Faro", "end": "Zackopane", "points": 20}, {"start": "Plasencia", "end": "Český Krumlov", "points": 20}, {"start": "Lisbon", "end": "Ohrid", "points": 20}, {"start": "Brat is Lava", "end": "Pinhão", "points": 20}, {"start": "Pinhão", "end": "Prague", "points": 20}, {"start": "Brat is Lava", "end": "Kolari", "points": 20}, {"start": "Kuopio", "end": "Poiana Ilvei", "points": 20}, {"start": "Abisko", "end": "Poiana Ilvei", "points": 20}, {"start": "Niš", "end": "Trondheim", "points": 20}, {"start": "Blankso", "end": "Lisbon", "points": 20}, {"start": "Kolari", "end": "Poiana Ilvei", "points": 20}, {"start": "Plasencia", "end": "Warsaw", "points": 20}, {"start": "Lisbon", "end": "Spisske Vlachy", "points": 20}, {"start": "Plasencia", "end": "Riga", "points": 20}];

const map = L.map('map', {
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 120
}).setView([54.5, -3], 6);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const routeLayerGroup = L.layerGroup().addTo(map);
const stationLayerGroup = L.layerGroup().addTo(map);
const stationGuideLayerGroup = L.layerGroup().addTo(map);
const routeLayersById = {};
const routeGroups = {};
const segmentToRouteKey = {};
const stationLayersByName = {};
const stationCoordsByName = {};
let selectedGuideStationName = null;

let sbClient = null;
try {
  if (window.supabase) {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (err) {
  console.error('Supabase init failed', err);
}

const TRAIN_CARD_TYPES = [
  { key: 'red-orange', label: 'Red / Orange' },
  { key: 'green-yellow', label: 'Green / Yellow' },
  { key: 'blue-purple', label: 'Blue / Purple' },
  { key: 'white-black', label: 'White / Black' },
  { key: 'rainbow', label: 'Rainbow' }
];
const TRAIN_CARD_LOOKUP = Object.fromEntries(TRAIN_CARD_TYPES.map(card => [card.key, card]));
const TRAIN_CARD_CHALLENGE_DECK = {"red-orange":[{"name":"Challenge name placeholder","description":"Dance To The Nathional Anthem In The Most Majestic Location Possible","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Bowl a Strike","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Give your teammate a piggyback ride around a local park","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Ascend 500 feet/152 meters to a high point without touching pavement.","reward":1,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Go bungee jumping.","reward":4,"locale":"Town"},{"name":"Challenge name placeholder","description":"Make a 30-second parkour video.\nThe video must feature both teammates attemping to do parkour in an urban area. You must create and edit an actual video with music, transitions, and at least 2 effects.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Touch snow.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Run a \"local pastry mile.\" Run one mile on a track in under 15 minutes. At the beginning of the mile—and after every quarter mile—you must stop and eat the entirety of one pastry that originated (or was significantly modified) in the country that you're currently in. These pastries must be roughly equivalent to one donut in weight. Only one team member needs to participate.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Criticize the most beautiful place\nTravel to the most beautiful location within 1 hours travel from your current location. While as close as reasonably possible to the place, list three things that you hate about it.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Do 100 Squats","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Win a game of paintball. Both team members must participate, and they must be on the same team. There must be at least two other people playing. Any paintball game is acceptable, as long as one team can be declared the victor.#","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Get a hole in one in mini golf\nScore a hole in one at a mini golf course. A team cannot play a hole more than once; if you run out of holes, you must go to a different course.\n\nAny hole where a a hole in one is expected does not count.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Build a snowman\nThe snowman must be made of snow and found outdoors—it may be natural or from a snow machine.\n\nThe snowman must be at least one foot tall.\n\nThe snowman must have at least three body sections.","reward":4,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Build a raft\nYou must construct a raft and cross at least 10 feet of reasonably safe and still water.\n\nBoth team members must board the raft and and cross all ten feet with their weight entirely on the raft. This can be done together or separately.\n\nYou cannot spend more than $50 on materials.\n\nThe raft must be constructed of multiple utilitarian elements, which may include floatation devices.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"High five at the highest point\nCapture a photo of both team members jumping and high fiving at the highest point in the country.\n\nThe highest point must be publicly accessible and you must be off the ground when high fiving.","reward":4,"locale":"City"},{"name":"Challenge name placeholder","description":"Clean up a national park\nYou must pick up at least 5 separate pieces of litter and properly dispose of them.\n\nThe litter cannot be artificially created or split into several pieces of litter.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Dock a Boat\nConstruct a small boat out of any material. On the beach, mark out a one-foot \"dock.\" Using only your breath, guide the boat from a distance of 49 feet or 15 meters in the water into the dock.","reward":4,"locale":"Town"},{"name":"Challenge name placeholder","description":"Be fast and furious\nReach a speed of 20 mph by your own power while angry ranting about something you don't like. You can confirm speed by using the Speedometer Simple App.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Make a putt\nRoll a ball into a cup from a distance of 10 feet.\n\nThe cup may be no larger than 6 inches in diameter.\n\nYou may spend as long as you wish setting up items to aid its roll. Any tests you conduct may not use the ball.\n\nYou get one attempt, If you fail, the challenge is automatically vetoed.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Climb a tree\nClimb up a tree at least 4 feet off the ground.","reward":1,"locale":"Town"},{"name":"Challenge name placeholder","description":"Dance like nobody's watching\nGet 1000 feet from the nearest building. Once stationed, both team members must memorize and successfully perform Amy's TikTok dance, at tempo, with no mistakes.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Have a picnic on the beach\nWhile sitting on a beach, both team members must share and enjoy at least three different foods.","reward":1,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Throw a paper airplane 30 consecutive feet\nYou must throw the airplane such that there is no reasonable risk of hitting anyone.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Find 5 Different Fish in 5 Minutes\nPort Noarlunga Reef is home to more than 200 species of marine plants and over 50 different species of fish. Enter the water in snorkel gear (or just goggles, if you're feeling brave). From the moment you enter the water, you have 5 minutes to capture, on camera, at least 5 different species of fish.","reward":4,"locale":"City"},{"name":"Challenge name placeholder","description":"Get Goosebumps Near a Goose\nFilm a shot, at least 10 seconds long, of one teammate having visible goosebumps with at least one goose also in the frame. If the goose leaves the frame, the contract is automatically voided. You must complete this challenge in 45 minutes.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Guesstimate a kilometer\nStarting from this place you were when you pulled this card, without measuring, get as close to one kilometer away as you can (measured as the crow flies) You must be right within 30%.\n\nIf you fail, you may not reattempt.\n\nApart from a timer/watch, you may not consult your phone, maps, or any other tools before completing or vetoing this challenge.\n\nReward: 1,000","reward":2,"locale":"Town"}],"green-yellow":[{"name":"Challenge name placeholder","description":"Paint Or Draw A Local Landscape","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Eat The National Dessert","reward":2,"locale":"Town"},{"name":"Grass Routes","description":"Attend a Local Event","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Respect the weirdest roadside attraction\nVisit the weirdest roadside attraction in your state. You must stand directly in front of it and salute it for the entire duration of the national anthem.\n\nIf it is possible to gain admission to the attraction (i.e. a museum) you must do so and spend at least 15 minutes there.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get A Pedicure\nBoth members must get the pedicure. It must be both feet.\n\nYou must get your nails painted the state colors. If the state does not have official state colors, you may get a clear coat.\n\nYou may not ask the salon to be quick or indicate in any way that you are under time pressure.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Eat the National Dish","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Ship this card\nUsing any public or private shipping service, ship this card to a different country. You may use overnight shipping.\n\nWhen you retrieve this card, claim the reward","reward":4,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get One Team Member Intoxicated\nYou may get intoxicated at any bar in the state.","reward":1,"locale":"Town"},{"name":"Challenge name placeholder","description":"Eat Spicy Food\nGo to a local Indian restaurant and ask them for the hottest food they can serve you. Eat the entire thing.\n\nWhile ordering, you must say, \"I want the spiciest thing on the menu.\"","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Skip a stone over a sunken town\nUsing Wikipedia's list of sunken towns, travel to a sunken town and skip a stone over the body of water that sank the town.\n\nThe stone must skip (touch the water) at least three times.","reward":4,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Visit an unpopular museum.\n\"Unpopular museum\" is defined as any museum with fewer than 200 reviews on TripAdvisor. You must spend at least 30 minutes in the museum, and you must recite, on camera, at least 3 facts that you learned. You may only travel by public transit; no taxis or ride-sharing allowed.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Find A Statue And Recreate ItThe statue must be at least 100 meters from the capitol building.\n\nYou may not use the internet to locate a statue.\n\nYou must hold the pose for at least 5 minutes.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Spell \"HELP\" in rocks on an island\nTravel to a landmass officially defined as an island.\n\nAnywhere on the island, legibly spell the word \"HELP\" using rocks collected from the island.\n\nEach letter must be at least one foot tall.\n\nYou must properly disassemble at the end.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Estimate your city's population\nYou may only guess once.\n\nIn this context, city means municipality.\n\nYou cannot use your phone, the internet, or ask anyone any questions while this challenge is active.\n\nIf you are off by more than 25%, this card is automatically vetoed.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Go To A Museum\nYou must buy entry to and spend at least half an hour at a museum of your choice.\n\nYou must tell the camera five fun facts you learned.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Stalk a bird\nYou must have a single bird on camera continuously for five minutes.\n\nIf you ever lose sight of the bird or have to cut, you have to start over.\n\nThe bird must be alive, and may not be caged.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Find the town hall\nYou have 30 minutes to find the town hall of wherever you are without consulting your phone or asking anyone for help.\n\nIf the building you assert to be the town hall is not the town hall, you automatically veto the challenge.\n\nIf you fail to find the town hall within 30 minutes, you automatically veto the challenge.\n\nReward: 900","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Praise the ugliest building\nTravel to the ugliest building in your city. List three things that you love about it while standing a maximum of 300 feet away from it.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Fight them on the beaches\nSend a menacing image to the jetlag discord from 3 of the following locations:\n\nA beach (anywhere where natural water meets land)\nA landing ground (any spot where an aircraft lands)\nA field\nA street\nA hill (any point on the ground that is five feet above a visible adjoining point on the ground. Paved areas are fine, but human made structures do not count.)","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"See something old\nYou have 30 minutes to find the oldest thing you can.\n\nYou must be able to verify the thing's age within 50 years.\n\nYou may declare the challenge complete earlier than 30 minutes if you choose.","reward":"age/200","locale":"Town"},{"name":"Challenge name placeholder","description":"Go to something interesting\nWithout researching on YouTube, go to something that has a YouTube video about it with at least 100,000 views.\n\nThe YouTube video's title must either include the thing's name, or clearly be referencing it as its main focus.\n\nIf you cannot find a video correlating to your location you may either retry or veto the challenge.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Communicate by morse\nStand at least 20 feet away from your partner. Using a random word generator, generate a random 8 letter word. Communicate the word to your partner using morse code. If you fail, you may re-attempt with a new word.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Buy The Same Thing As Your Teammate\nPick any store. One teammate will go in, purchase one item, and then hand it to their blindfolded teammate. The blindfolded teammate may inspect the item as much as they want, then has one attempt to purchase the same item.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Spell your name in graffiti\nFind all of the letters in one team member's first name in already-written graffiti.\nFor example, for Adam, find A, D, and M","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Sense the Passage of Time\nStart a timer. Both teammates may not look at any clocks or timers until you stop this timer. You may practice, but you may not consult any regularly scheduled thing (a bus, for example) to use as a makeshift clock. You succeed if you stop this timer within 3 minutes of the 30 minute mark.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Predict Market Flow \n Select any market stall  or shopand make a prediction about how many customers it will get in the next ten minutes. A customer is defined as any person who spends money at the stall. If your prediction is more than 40% off, this challenge is failed. If no one visits the stall in the 10 minutes you lose automatically.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Calculate Boba\nOrder one bubble tea at any bubble tea vendor. From the second you pick up your drink, you have one minute to examine it and determine the number of boba inside. Drink the tea and empty out the boba to check your answer. If you were more than 10% off, this challenge is failed.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Make a cup of fine coffee\nObtain at least 20 whole coffee beans.\n\nGrind the beans yourself and filter one cup of water through the grounds until at least this* color or darker.\n\nTake a sip of the coffee and go \"mmmmmm.\"","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"SHOP LIKE A LOCAL\nGo to a cafe (or any counter-service establishment) and order something. At no point can the server speak to you in English. If they speak to you in English, you automatically veto this challenge.\n\nThe challenge is completed when you receive your item and leave the cafe.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Toss a Tempting Meal\nThrow a single piece of food. Within 10 seconds of it touching the ground (or water), something besides you must eat it. If the food is not eaten after 10 seconds, this challenge is failed.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"DATE AN OLD THING\nFind an old structure. You have one guess to accurately predict which century it was built in.\n\nYou may not use your phone or any concrete information concerning it's construction date. You must make this guess using contextual clues.\n\nIf your guess is wrong, you cannot find a reliable date of construction or if your building was constructed during the 20th or 21st century, this challenge is automatically vetoed.\n\nReward: 1,000","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"CREATE A DISPUTATION ON THE POWER AND EFFICACY OF INDULGENCES\nWrite down 95 of your opinions on paper. The average word count of your opinions must be at least 5.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Whine\nAcquire or create a stemmed glass (It doesn't necessarily need to be made of glass) of wine and drink at least 5 oz while complaining about a topic of your choosing.\n\nYou may not construct the glass out of materials traveling with you.\n\nReward: 750","reward":1,"locale":"City"},{"name":"Challenge name placeholder","description":"BE funnier than CHATGPT\nSpend any amount of time writing an original joke about the country you are currently in. Then, ask CHATGPT 3.5 to generate a joke about that country. Post both jokes in the jetlag uk discord and ask the audience to decide which joke is funnier, with a five minute timer. If the AI's joke wins, this challenge is vetoed.\n\nThe prompt must be \"Write me one joke about [COUNTRY].\"","reward":2,"locale":"City"}],"blue-purple":[{"name":"Challenge name placeholder","description":"Bury A Treasure worth £10 so someone may find it","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Buy the local paper and solve one of the puzzles","reward":1,"locale":"Town"},{"name":"Challenge name placeholder","description":"Paint Your Teammate's Face As The Flag\nOnly one teammate must get their face painted.\n\nThis must cover their full face.\n\nIt must recognizably be the nations flag.\n\nYou can use any paint, but you should probably use face paint. Makeup is also acceptable.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Catch 3 Local Bugs","reward":1,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get One Team Member Intoxicated\nYou may get intoxicated at any bar in the country","reward":1,"locale":"Town"},{"name":"Challenge name placeholder","description":"Eat a McDonald's Item You Cannot Get in The US.","reward":1,"locale":"City"},{"name":"Challenge name placeholder","description":"Paint A Local Landscape\nYou must present your painting to the camera.\n\nYou must make a reasonable attempt to create a decent painting using several colors and covering the majority of the canvas.\n\nThe painting must be on canvas or paper.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Build and ride a go-kart.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Get drunk on a local liquor","reward":1,"locale":"City"},{"name":"Challenge name placeholder","description":"Catch a fish.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Have a good time. You must have a good time for at least 2 hours. This time must be spent actively and on a variety of activities; you cannot sleep. If you do not have a sufficiently good time, the audience must yell at you.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Pick up three pounds of trash.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Eat a bug.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Touch a bird.","reward":4,"locale":"Town"},{"name":"Challenge name placeholder","description":"Take a photo at your city's top 5 landmarks.\nIn this challenge, \"top 5 landmarks\" are defined as the 5 most popular \"attractions\" on TripAdvisor that have at least 1,000 reviews. You may only travel by public transit; no taxis or ride-sharing allowed. The photos must be taken within at least 500 feet of each attraction, and, if applicable, at least one photo must be taken in the attraction after gaining admission.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Retrieve a shell from a depth of at least ten feet underwater.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Transfer a cup of fountain water from one fountain to another.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Visit the Dutch or Uk Cosolate\nYou may not use your phone or the internet to look up where your local consulate is. You may only travel by public transit; no taxis or ride-sharing allowed.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Eat an Egg","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Commit an American Crime","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Eat at the worst restraunt\nUsing Trip Advisor, you must determine the worst-reviewed restaurant within 2 miles and eat a full meal there. It must have at least 10 reviews.\n\nIf the restaurant is closed, you can select the next most worst-reviewed restaurant that is open.\n\nIt must be something prepared by the restaurant—nothing pre-packaged.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Forge great european art\nfind the most famous painter from your current country. Google their name and the word painting and select the first result.  Attempt to forge it.\n\nYou must use at least 3 different colors, cover at least 75% of the canvas, and spend at least 15 minutes drawing or painting.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Touch An Animal That's Not A Pet\nMouse sized or bigger.\n\nThe animal must be alive.\n\nThe animal may be in captivity/domesticated, but it may not be attempting to become a pet (no shelters or pet stores.)","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Have a fast 3-course meal\nEach course must be purchased at a different fast food chain.\n\nYou must sit down at the restaurant and complete your whole course before moving on to the next.\n\nThe courses are appetizer, main, and dessert. The appetizer can be anything, but the main must be advertised as a main, and the dessert must be advertised as a dessert.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Make s'mores over an open fire\nYou must build the fire in a place designated for fire, or where there is otherwise no perceptible risk of damaging anything or the fire spreading.\n\nA s'more is defined as having two graham crackers, at least one toasted marshmallow, and some amount of chocolate.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Drink a piña colada in the rain\nYou must be outside during natural rainfall; a drizzle is acceptable, but it must be recognizable as rain.\n\nAt least one team member must be drinking a beverage that would be reasonably called a \"piña colada\". A virgin piña colada is acceptable.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Win a prize from a claw machine\nThe claw machine can be anywhere and any size, but it must be reasonably recognizable as a claw machine.\n\nYou may play the claw machine as many times as you want.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Find 3 new friends\nFind 3 species of living, non-bug, non-bird, non-human animals. You must clearly capture them on camera.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Collect 3 Mario Kart items\nCollect 3 items from Mario Kart. Your options are: banana peel, mushroom, big yellow star, shell, bullet (not real obviously), bomb (not real obviously), boomerang, coin, squid, feather, venus fly trap. No duplicates.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Get a snack on a stick\nIt must be on the stick when you buy it.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Do a taste test\nAcquire a bag of Haribo Gold Bears. Close you eyes. Taste three gold bears and guess their flavors. You must get all three correct. If you do not succeed, you must wait 10 minutes before trying again.\n\nYou may practice.","reward":1,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Spend exactly 5.10 euros","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Burn this card\nThis card must be burned within 5 minutes of pulling it. If you fail to burn this card in five minutes, it is vetoed.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Contribute to a waterfall\nCarry a full cup of water to a natural waterfall without spilling more than 10% of it. Your cup must be full of water starting at least ¼ mile from the waterfall. Once at the waterfall, add the cup's content to the waterfall's flow.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Cursed!\nYou now have wet hat syndrome. For the rest of the day, your hat must be wet at all times.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Bribe the chief of police\nVisit any local police station and leave a dollar outside with a note outlining your demands.","reward":4,"locale":"City"},{"name":"Challenge name placeholder","description":"Explain the birds and the bees to a bird or a bee\nThe explanation must be at least 20 seconds.\nYou must be within at least 3 feet of the bird or bee while explainig.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Eat an alliterative sandwich\nCreate and eat the entirety of a sandwich with 5 fillings, all of which must start with the same letter.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Face cookie\nPlace a cookie of any kind on your forehead. Without using your hands, and without help, eat the cookie.","reward":1,"locale":"City"},{"name":"Challenge name placeholder","description":"Get knighted at a castle\nUsing a sword (which may be makeshift) both teammates must knight each other outside of an castle.","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get a team mascot\nAcquire any stuffed animal or figurine. Name it and keep it with you the rest of the game.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Pop a kernel of corn\nYou may use any means to pop the kernel.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"See a cow\nNo description available","reward":1,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Distinguish Wines\nOne team member must purchase 3 glasses of wine (a red, a white, and a rose) and bring them to the other team member, who is blindfolded. The blindfolded team member must successfully guess which one is which. You may not practice. No sparkling wines. Ask them to please put them all in identical glasses.","reward":1,"locale":"Town"},{"name":"Challenge name placeholder","description":"Build A Car\nConstruct a car no larger than one square foot. One races-the car must, with one push, successfully cover a distance of 35 feet. You get one attempt. You may not do any practice attempts longer than five feet. You may not use any materials traveling with you.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"PLAY LOCAL SPIRIT PONG\nFind any alcohol produced in your current country and pour it in a cup.\n\nThrow any item from a distance of six feet into the cup.\n\nYou have ten attempts. If you fail, this challenge is automatically vetoed","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Eat, Pray, Love\nIn the following order, you must:\n\n•Eat an entire slice of pizza.\n\n•Visit any site of religious worship (you do not have to enter, but you must stand directly outside the building.)\n\n•Call a member of your family and tell them how much you love and respect them for at least 30 seconds. If they do not pick up, you may text them instead.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Finish a Puzzle\nSteal 40%Acquire and complete a jigsaw puzzle of at least 250 pieces. If you don't finish the puzzle in 60 minutes, this challenge is failed.","reward":2,"locale":"City"}],"white-black":[{"name":"Challenge name placeholder","description":"Go exactly one mile\nClose your eyes, spin in a circle, and point in a random direction. You must go as close as possible (on publicly-accessible land) to the location exactly 1 mile in that direction.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Travel 1 mile under human power.You can travel in any vessel you'd like, but it cannot be powered by a motor or sail. Any body of water is acceptable. Both team members must travel that distance.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Ride 3 miles on rollercoasters.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Cursed!\nUntil the next time you get lay a complete route, you cannot use your phone to research information. You may only use it for the following things:\n\nBooking seat reservation (but NOT researching routes)\nFilming\nVerifying answers if a challenge requires it\nAccounting\nEmergencies\nUnless vetoed, this card is claimed immediately.\n\nReward: 2,000","reward":4,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get 1,000 ft from any building","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Find a fancy car\nThe car must have a sticker price of more than €100,000 (or equivalent) in the country you're in.\n\nYou must film yourself in front of the car.\n\nIt must be a real car, not a depiction.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Complete a math minute for each station called at on your current connection","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get on a train immediately\nYou must be on a moving train in the next 10 minutes.\n\nIf you are not on a moving train in the next 10 minutes, this card is vetoed.\n\nMetro trains count as trains, including rubber-wheeled trains.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Swap to a tote\nFind a tote bag. Remove every item from your backpack and put them in the tote bag. You may not use your backpack until the next time you get tagged.\n\nIf one tote bag is not enough to fit all of your possessions, you may use multiple tote bags.\n\nAny bag that you carry with handles like a tote bag counts as a tote bag.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Cursed!\nGet on a late train; the next train you get on must arrive at the station where you board at least one minute late.\n\n\"One minute late\" is reached at the start of the minute after the indicated one (e.g. for 12:43 scheduled \"late\" is as soon as the clock displays 12:44.)","reward":2,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Cursed!\nThe name of the next town, city, or municipality that you disembark in cannot be longer than five letters.\n\nUnless vetoed, this card is claimed immediately.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Cursed!\nRoll a die. Whatever number you roll, you must take that number train on the departure board at your nearest station. (If you roll a 4, you must take the fourth train on the board, etc.)\n\nUnless vetoed, this card is claimed immediately.\n\nReward: 800","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Cursed!\nTurn the language settings on your research phone to the language of your curent country for the next two hours. If drawn as a team, both teammates must participate.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Cursed!\nYou are now a knight. You may only walk or run in the pattern of a knight. For every three steps forward you take, you must take one step to the side.\n\nYou will remain a knight until you go to a castle. Anything Google Maps classifies as a castle counts.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Cursed!\nFor the rest of the day, you may only take transportation that leaves at odd-numbered times.\n\nThis is based on the last digit of scheduled departure time","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"Cursed!\nYou are now being Ratatouille'd.\n\nThe next move you make must be decided by a rat. Please access the Smithsonian Zoo's naked mole rat live feed and go to Camera 2.\n\nWhatever direction you first see a rat cross the camera, you must travel at least two miles in that direction before continuing. This is defined as full movement through the tube. The horizontal tube denotes east/west; the diagonal tube denotes north/south.","reward":3,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Do a mile drunk (not high)\nRun a mile. For each quarter mile, you must drink ¼ the amount of alcohol that would get a player legally drunk.","reward":2,"locale":"Town"},{"name":"Challenge name placeholder","description":"Get a car to honk\nWrite anything on a sign that inspires a passing car to honk their horn.","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Ride a horse\nThe horse must be a real, living horse. You must ride it for at least 5 minutes.","reward":4,"locale":"Rural"},{"name":"Challenge name placeholder","description":"Get on a boat","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Write a word on Strava\nOne team member must generate a four letter word. They must then write the word on Strava until their teammate guesses it.","reward":2,"locale":"City"},{"name":"Challenge name placeholder","description":"While standing at least 10 feet apart in two different countries, one team member must hit the other team member with a piece of pie. You must clean up the pie.","reward":3,"locale":"Town"},{"name":"Challenge name placeholder","description":"Dump One Ocean in Another Ocean","reward":3,"locale":"City"},{"name":"Challenge name placeholder","description":"Predict The Train Doors\nstand where you believe the doors of a local train will be when the train stops. If any part of you lines up with any part of the door, you win. You may observe trains before attempting. You must be in position 20 seconds before the train stops.","reward":2,"locale":"Town"}]};
const TRAIN_CARD_STANDARD_KEYS = TRAIN_CARD_TYPES.filter(card => card.key !== 'rainbow').map(card => card.key);
let trainCardIdCounter = 0;

let currentSearch = "";
let gameState = createNewGameState();
let isApplyingRemoteState = false;
let lastKnownUpdatedAt = null;
let persistTimer = null;
let selectedOfferIndexes = new Set();
let previewVisibleTrainCardId = null;
let isTrainCardTrayOpen = false;

function renderOffer() {
  return renderOfferModule({
    gameState,
    selectedOfferIndexesRef: () => selectedOfferIndexes,
    updateSelectedOfferIndexes: next => { selectedOfferIndexes = next; },
    updateDrawControls,
    renderHand,
    escapeHtml
  });
}

function renderHand() {
  return renderHandModule({
    gameState,
    buildClaimedGraph,
    getHighlightedStationNames,
    areCitiesConnected,
    clearStationGuides,
    updateStationStyles,
    updateStats,
    selectedGuideStationNameRef: () => selectedGuideStationName,
    escapeHtml
  });
}

function updateDrawControls() {
  return updateDrawControlsModule({
    gameState,
    selectedOfferIndexes
  });
}

function drawTickets() {
  return controller.onDrawTickets();
}

function keepSelectedTickets() {
  return controller.onKeepSelectedTickets();
}

function setSyncStatus(kind, message) {
  const pill = document.getElementById('syncStatus');
  const text = document.getElementById('syncMessage');
  pill.className = 'status-pill ' + (kind === 'online' ? 'status-online' : kind === 'offline' ? 'status-offline' : 'status-pending');
  pill.textContent = kind === 'online' ? 'Connected' : kind === 'offline' ? 'Offline mode' : 'Syncing…';
  text.textContent = message;
}

function shuffleArray(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeTicket(ticket) {
  return {
    start: String(ticket.start).trim(),
    end: String(ticket.end).trim(),
    points: Number(ticket.points)
  };
}




function formatChallengeReward(value) {
  return formatChallengeRewardModule(value);
}

function randomTrainCardKey() {
  return randomTrainCardKeyModule(TRAIN_CARD_TYPES);
}

function getChallengePool(typeKey) {
  return getChallengePoolModule(typeKey, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK);
}

function createChallengeForType(typeKey) {
  return createChallengeForTypeModule(typeKey, TRAIN_CARD_STANDARD_KEYS, TRAIN_CARD_CHALLENGE_DECK);
}

function createTrainCard(typeKey, forceType = false) {
  return createTrainCardModule({
    typeKey: forceType ? typeKey : (TRAIN_CARD_LOOKUP[typeKey] ? typeKey : "rainbow"),
    TRAIN_CARD_LOOKUP,
    TRAIN_CARD_STANDARD_KEYS,
    TRAIN_CARD_CHALLENGE_DECK,
    getTrainCardIdCounter: () => trainCardIdCounter,
    setTrainCardIdCounter: value => { trainCardIdCounter = value; }
  });
}

function sanitizeTrainCard(raw, fallbackType = "rainbow") {
  return sanitizeTrainCardModule({
    raw,
    fallbackType,
    TRAIN_CARD_LOOKUP,
    TRAIN_CARD_STANDARD_KEYS,
    TRAIN_CARD_CHALLENGE_DECK,
    getTrainCardIdCounter: () => trainCardIdCounter,
    setTrainCardIdCounter: value => { trainCardIdCounter = value; }
  });
}

function countRainbowCards(cards) {
  return countRainbowCardsModule(cards);
}

function dealFreshVisibleTrainCards() {
  return dealFreshVisibleTrainCardsModule({
    TRAIN_CARD_TYPES,
    TRAIN_CARD_LOOKUP,
    TRAIN_CARD_STANDARD_KEYS,
    TRAIN_CARD_CHALLENGE_DECK,
    getTrainCardIdCounter: () => trainCardIdCounter,
    setTrainCardIdCounter: value => { trainCardIdCounter = value; }
  });
}

function normalizeVisibleTrainCards(raw) {
  return normalizeVisibleTrainCardsModule({
    raw,
    TRAIN_CARD_LOOKUP,
    TRAIN_CARD_TYPES,
    TRAIN_CARD_STANDARD_KEYS,
    TRAIN_CARD_CHALLENGE_DECK,
    getTrainCardIdCounter: () => trainCardIdCounter,
    setTrainCardIdCounter: value => { trainCardIdCounter = value; }
  });
}

function normalizeTrainHandCards(raw, legacyCounts) {
  return normalizeTrainHandCardsModule({
    raw,
    legacyCounts,
    TRAIN_CARD_LOOKUP,
    TRAIN_CARD_STANDARD_KEYS,
    TRAIN_CARD_CHALLENGE_DECK,
    getTrainCardIdCounter: () => trainCardIdCounter,
    setTrainCardIdCounter: value => { trainCardIdCounter = value; }
  });
}

function normalizeCompletedChallengeCards(raw) {
  return normalizeCompletedChallengeCardsModule({
    raw,
    TRAIN_CARD_LOOKUP,
    TRAIN_CARD_STANDARD_KEYS,
    TRAIN_CARD_CHALLENGE_DECK,
    getTrainCardIdCounter: () => trainCardIdCounter,
    setTrainCardIdCounter: value => { trainCardIdCounter = value; }
  });
}

function reshuffleVisibleTrainCardsIfNeeded() {
  return reshuffleVisibleTrainCardsIfNeededModule({
    gameState,
    normalizeVisibleTrainCards,
    dealFreshVisibleTrainCards
  });
}

function getPreviewTrainCard() {
  return getPreviewTrainCardModule({
    previewVisibleTrainCardId,
    gameState,
    normalizeVisibleTrainCards
  });
}

const controller = createGameController({
  // ---- STATE ACCESS ----
  getGameState: () => gameState,
  setGameState: (next) => { gameState = next; },

  createNewGameState,

  getSelectedOfferIndexes: () => selectedOfferIndexes,
  setSelectedOfferIndexes: (next) => { selectedOfferIndexes = next; },

  getPreviewVisibleTrainCardId: () => previewVisibleTrainCardId,
  setPreviewVisibleTrainCardId: (next) => { previewVisibleTrainCardId = next; },

  // ---- ROUTE SYSTEM ----
  routeGroups,
  routeLayersById,
  segmentToRouteKey,

  updateRouteStyle,
  bindRoutePopup,
  refreshAllTrainOverlays,

  // ---- RENDER FUNCTIONS ----
  renderOffer,
  renderHand,
  renderVisibleTrainCards,
  renderTrainHand,
  renderActiveChallengeCard,
  renderCompletedChallenges,
  updateStationStyles,
  updateStats,
  updateDrawControls,
  clearStationGuides,

  // ---- PERSIST ----
  queuePersist
});

function computeTrainCarStoreCounts() {
  return computeTrainCarStoreCountsModule({
    gameState,
    createEmptyTrainCarCounts,
    normalizeCompletedChallengeCards
  });
}

function setTrainCardTrayOpen(isOpen) {
  return setTrainCardTrayOpenModule({
    isOpen,
    setIsTrainCardTrayOpen: value => { isTrainCardTrayOpen = value; }
  });
}

function openTrainCardTray() {
  return openTrainCardTrayModule(setTrainCardTrayOpen);
}

function closeTrainCardTray() {
  return closeTrainCardTrayModule(setTrainCardTrayOpen);
}

function toggleTrainCardTray() {
  return toggleTrainCardTrayModule(isTrainCardTrayOpen, setTrainCardTrayOpen);
}

function renderVisibleTrainCards() {
  return renderVisibleTrainCardsModule({
    gameState,
    TRAIN_CARD_LOOKUP,
    normalizeVisibleTrainCards,
    previewVisibleTrainCard,
    escapeHtml
  });
}

function renderActiveChallengeCard() {
  return renderActiveChallengeCardModule({
    gameState,
    TRAIN_CARD_LOOKUP,
    previewVisibleTrainCardId,
    sanitizeTrainCard,
    getPreviewTrainCard,
    formatChallengeReward,
    claimPreviewedChallenge,
    clearPreviewedChallenge,
    completeActiveChallenge,
    escapeHtml
  });
}

function renderTrainHand() {
  return renderTrainHandModule({
    gameState,
    TRAIN_CARD_TYPES,
    TRAIN_CARD_LOOKUP,
    computeTrainCarStoreCounts,
    computeAvailableTrainCarCounts,
    escapeHtml
  });
}

function renderCompletedChallenges() {
  return renderCompletedChallengesModule({
    gameState,
    TRAIN_CARD_LOOKUP,
    normalizeCompletedChallengeCards,
    formatChallengeReward,
    escapeHtml
  });
}

function previewVisibleTrainCard(cardId) {
  return previewVisibleTrainCardModule({
    cardId,
    gameState,
    normalizeVisibleTrainCards,
    setPreviewVisibleTrainCardId: value => { previewVisibleTrainCardId = value; },
    openTrainCardTray,
    renderActiveChallengeCard
  });
}

function clearPreviewedChallenge() {
  return clearPreviewedChallengeModule({
    setPreviewVisibleTrainCardId: value => { previewVisibleTrainCardId = value; },
    closeTrainCardTray,
    renderActiveChallengeCard
  });
}

function claimPreviewedChallenge() {
  return claimPreviewedChallengeModule({
    gameState,
    previewVisibleTrainCardId,
    normalizeVisibleTrainCards,
    sanitizeTrainCard,
    createTrainCard,
    reshuffleVisibleTrainCardsIfNeeded,
    setPreviewVisibleTrainCardId: value => { previewVisibleTrainCardId = value; },
    closeTrainCardTray,
    renderVisibleTrainCards,
    renderActiveChallengeCard,
    queuePersist
  });
}

function completeActiveChallenge() {
  return completeActiveChallengeModule({
    gameState,
    normalizeCompletedChallengeCards,
    sanitizeTrainCard,
    setPreviewVisibleTrainCardId: value => { previewVisibleTrainCardId = value; },
    closeTrainCardTray,
    renderActiveChallengeCard,
    renderTrainHand,
    renderCompletedChallenges,
    queuePersist
  });
}
function createNewGameState() {
  return {
    claimed_segments: [],
    tickets_deck_remaining: shuffleArray(ALL_TICKETS.map(normalizeTicket)),
    tickets_offer: [],
    tickets_hand: [],
    visible_train_cards: dealFreshVisibleTrainCards(),
    active_challenge_card: null,
    completed_challenge_cards: [],
    route_claim_costs: {},
    active_preview_card: null,
    challenge_deck_remaining: [],
    connection_points: 0,
    ticket_points: 0,
    total_points: 0
  };
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function normalizeRouteClaimCosts(raw) {
  const costs = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return costs;
  Object.entries(raw).forEach(([routeKey, plan]) => {
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return;
    const cleanPlan = {};
    Object.entries(plan).forEach(([typeKey, count]) => {
      if (!TRAIN_CARD_LOOKUP[typeKey]) return;
      const n = Math.max(0, Number(count) || 0);
      if (n > 0) cleanPlan[typeKey] = n;
    });
    if (Object.keys(cleanPlan).length) costs[String(routeKey)] = cleanPlan;
  });
  return costs;
}

function serializeTrainStore() {
  const earned = computeTrainCarStoreCounts();
  const available = computeAvailableTrainCarCounts();
  const store = Object.fromEntries(TRAIN_CARD_TYPES.map(card => [
    card.key,
    {
      available: Number(available[card.key]) || 0,
      earned: Number(earned[card.key]) || 0
    }
  ]));
  store._meta = {
    visible_train_cards: normalizeVisibleTrainCards(gameState.visible_train_cards),
    route_claim_costs: normalizeRouteClaimCosts(gameState.route_claim_costs)
  };
  return store;
}

function normalizeState(raw) {
  const fallback = createNewGameState();
  const legacyHandCards = normalizeTrainHandCards(raw?.train_hand_cards, raw?.train_hand_counts);
  const legacyActiveId = raw?.active_train_card_id ? String(raw.active_train_card_id) : null;
  const legacyActiveCard = legacyHandCards.find(card => card.id === legacyActiveId) || legacyHandCards[0] || null;
  const persistedActiveCard = raw?.active_challenge_card || raw?.active_challenge || null;
  const persistedCompletedCards = raw?.completed_challenge_cards || raw?.completed_challenges || [];
  const syncedTrainStore = raw?.train_store && typeof raw.train_store === 'object' && !Array.isArray(raw.train_store) ? raw.train_store : null;
  const syncedMeta = syncedTrainStore && syncedTrainStore._meta && typeof syncedTrainStore._meta === 'object' && !Array.isArray(syncedTrainStore._meta)
    ? syncedTrainStore._meta
    : null;

  const state = {
    claimed_segments: Array.isArray(raw?.claimed_segments) ? raw.claimed_segments.slice() : [],
    tickets_deck_remaining: Array.isArray(raw?.tickets_deck_remaining) ? raw.tickets_deck_remaining.map(normalizeTicket) : fallback.tickets_deck_remaining,
    tickets_offer: Array.isArray(raw?.tickets_offer) ? raw.tickets_offer.map(normalizeTicket) : [],
    tickets_hand: Array.isArray(raw?.tickets_hand) ? raw.tickets_hand.map(normalizeTicket) : [],
    visible_train_cards: normalizeVisibleTrainCards(raw?.visible_train_cards || syncedMeta?.visible_train_cards),
    active_challenge_card: persistedActiveCard ? sanitizeTrainCard(persistedActiveCard, 'rainbow') : (legacyActiveCard ? sanitizeTrainCard(legacyActiveCard, 'rainbow') : null),
    completed_challenge_cards: normalizeCompletedChallengeCards(persistedCompletedCards),
    route_claim_costs: normalizeRouteClaimCosts(raw?.route_claim_costs || syncedMeta?.route_claim_costs),
    active_preview_card: raw?.active_preview_card ? sanitizeTrainCard(raw.active_preview_card, 'rainbow') : null,
    challenge_deck_remaining: Array.isArray(raw?.challenge_deck_remaining) ? raw.challenge_deck_remaining.slice() : [],
    connection_points: Number(raw?.connection_points) || 0,
    ticket_points: Number(raw?.ticket_points) || 0,
    total_points: Number(raw?.total_points) || 0
  };

  if (
    !Array.isArray(raw?.tickets_deck_remaining) &&
    state.tickets_offer.length === 0 &&
    state.tickets_hand.length === 0 &&
    state.claimed_segments.length === 0 &&
    !persistedActiveCard &&
    !Array.isArray(persistedCompletedCards) &&
    !raw?.train_hand_cards &&
    Object.keys(state.route_claim_costs).length === 0
  ) {
    return fallback;
  }
  return state;
}

function parseRouteKey(name) {
  return String(name).split(' — ')[0].trim();
}

function parseRouteLength(name) {
  const match = String(name).match(/—\s*(\d+)\s+cars?/i);
  return match ? Number(match[1]) : 1;
}

function parseRouteClaimType(feature) {
  const style = String(feature?.properties?.styleUrl || '').toLowerCase();
  if (style.includes('grey')) return 'grey';
  if (style.includes('red') || style.includes('orange')) return 'red-orange';
  if (style.includes('green') || style.includes('yellow')) return 'green-yellow';
  if (style.includes('blue') || style.includes('purple')) return 'blue-purple';
  if (style.includes('white') || style.includes('black')) return 'white-black';
  return 'grey';
}

function getTrainCardTypeLabel(typeKey) {
  return getTrainCardTypeLabelModule(typeKey, TRAIN_CARD_LOOKUP);
}

function createEmptyTrainCarCounts(includeGrey = false) {
  return createEmptyTrainCarCountsModule(TRAIN_CARD_TYPES, includeGrey);
}

function computeSpentTrainCarCounts() {
  return computeSpentTrainCarCountsModule(gameState, TRAIN_CARD_TYPES);
}

function computeAvailableTrainCarCounts() {
  return computeAvailableTrainCarCountsModule({
    gameState,
    trainCardTypes: TRAIN_CARD_TYPES,
    computeTrainCarStoreCounts
  });
}

function chooseGreyRouteSpendPlan(required, availableCounts) {
  return chooseGreyRouteSpendPlanModule(required, availableCounts, TRAIN_CARD_STANDARD_KEYS);
}

function getRouteClaimOffer(routeKey) {
  return getRouteClaimOfferModule({
    routeKey,
    routeGroups,
    gameState,
    trainCardStandardKeys: TRAIN_CARD_STANDARD_KEYS,
    getTrainCardTypeLabel,
    computeAvailableTrainCarCounts
  });
}

function describeSpendPlan(plan) {
  return describeSpendPlanModule(plan, getTrainCardTypeLabel);
}

function parseRouteEndpoints(routeKey) {
  const parts = String(routeKey).split('↔').map(s => s.trim());
  return { start: parts[0] || routeKey, end: parts[1] || routeKey };
}

function isClaimed(id) {
  return gameState.claimed_segments.includes(id);
}

function matchesSearch(text) {
  if (!currentSearch) return false;
  return (text || '').toLowerCase().includes(currentSearch);
}

function stylePart(layer, styleObj, className) {
  layer.setStyle({ ...styleObj, className });
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex) {
  const cleaned = (hex || '#999999').replace('#', '');
  const value = parseInt(cleaned, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

function mix(hex, targetHex, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(targetHex);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}

function darken(hex, amount) {
  return mix(hex, '#000000', amount);
}

function lighten(hex, amount) {
  return mix(hex, '#ffffff', amount);
}

function polygonCentroid(latlngs) {
  const pts = latlngs.slice(0, -1);
  let lat = 0, lng = 0;
  pts.forEach(([a, b]) => { lat += a; lng += b; });
  return [lat / pts.length, lng / pts.length];
}

function projectLocal(latlngs) {
  const [cLat, cLng] = polygonCentroid(latlngs);
  const cosLat = Math.cos(cLat * Math.PI / 180);
  const pts = latlngs.map(([lat, lng]) => ({
    x: (lng - cLng) * cosLat,
    y: lat - cLat
  }));
  return { pts, cLat, cLng, cosLat };
}

function unprojectLocal(pts, cLat, cLng, cosLat) {
  return pts.map(({ x, y }) => [
    cLat + y,
    cLng + (cosLat === 0 ? 0 : x / cosLat)
  ]);
}

function orientedAxes(pts) {
  const core = pts.slice(0, -1);
  let meanX = 0;
  let meanY = 0;
  core.forEach(p => {
    meanX += p.x;
    meanY += p.y;
  });
  meanX /= core.length;
  meanY /= core.length;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  core.forEach(p => {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  });

  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const ux = Math.cos(theta);
  const uy = Math.sin(theta);
  const vx = -uy;
  const vy = ux;
  return { meanX, meanY, ux, uy, vx, vy };
}

function insetPolygon(latlngs, factorLong, factorShort = factorLong) {
  const { pts, cLat, cLng, cosLat } = projectLocal(latlngs);
  const axes = orientedAxes(pts);

  const oriented = pts.map(p => {
    const dx = p.x - axes.meanX;
    const dy = p.y - axes.meanY;
    return {
      u: dx * axes.ux + dy * axes.uy,
      v: dx * axes.vx + dy * axes.vy
    };
  });

  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
  oriented.slice(0, -1).forEach(p => {
    minU = Math.min(minU, p.u);
    maxU = Math.max(maxU, p.u);
    minV = Math.min(minV, p.v);
    maxV = Math.max(maxV, p.v);
  });

  const centerU = (minU + maxU) / 2;
  const centerV = (minV + maxV) / 2;

  const inset = oriented.map(p => {
    const scaledU = centerU + (p.u - centerU) * factorLong;
    const scaledV = centerV + (p.v - centerV) * factorShort;
    return {
      x: axes.meanX + scaledU * axes.ux + scaledV * axes.vx,
      y: axes.meanY + scaledU * axes.uy + scaledV * axes.vy
    };
  });

  return unprojectLocal(inset, cLat, cLng, cosLat);
}

function topEdgePolygon(latlngs, depth) {
  const pts = latlngs.slice(0, -1);
  if (pts.length !== 4) return null;
  const topA = pts[0];
  const topB = pts[1];
  const bottomB = pts[2];
  const bottomA = pts[3];
  const midTop = [(topA[0] + topB[0]) / 2, (topA[1] + topB[1]) / 2];
  const midBottom = [(bottomA[0] + bottomB[0]) / 2, (bottomA[1] + bottomB[1]) / 2];
  const vec = [midBottom[0] - midTop[0], midBottom[1] - midTop[1]];
  const edge1 = [topA[0] + vec[0] * depth, topA[1] + vec[1] * depth];
  const edge2 = [topB[0] + vec[0] * depth, topB[1] + vec[1] * depth];
  return [topA, topB, edge2, edge1, topA];
}

function routePalette(base, claimed, highlighted) {
  const isWhite = (base || '').toLowerCase() === '#ffffff';
  if (highlighted) {
    return {
      outerFill: darken(base, 0.28),
      outerStroke: '#f1d38c',
      innerFill: isWhite ? '#f6edd8' : lighten(base, 0.06),
      innerStroke: '#f4dfa6',
      shineFill: 'rgba(255,243,211,0.62)'
    };
  }
  if (claimed) {
    return {
      outerFill: isWhite ? '#ccb991' : darken(base, 0.34),
      outerStroke: '#24130b',
      innerFill: isWhite ? '#f7efdf' : darken(base, 0.08),
      innerStroke: isWhite ? '#9b8058' : darken(base, 0.26),
      shineFill: 'rgba(255,255,255,0.16)'
    };
  }
  return {
    outerFill: isWhite ? '#d8c6a4' : mix(base, '#f5ead4', 0.42),
    outerStroke: '#3f2918',
    innerFill: isWhite ? '#fbf5e8' : mix(base, '#fffaf0', 0.72),
    innerStroke: isWhite ? '#b3996d' : mix(base, '#6f5330', 0.35),
    shineFill: 'rgba(255,255,255,0.55)'
  };
}

function routeAngleDegrees(latlngs) {
  if (!map || !map._loaded) return 0;
  const pts = latlngs.map(ll => Array.isArray(ll)
    ? map.latLngToLayerPoint([ll[0], ll[1]])
    : map.latLngToLayerPoint(ll)
  );

  let bestDx = 1;
  let bestDy = 0;
  let bestLen2 = -1;

  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    const len2 = dx * dx + dy * dy;
    if (len2 > bestLen2) {
      bestLen2 = len2;
      bestDx = dx;
      bestDy = dy;
    }
  }

  let deg = Math.atan2(bestDy, bestDx) * 180 / Math.PI;
  while (deg > 90) deg -= 180;
  while (deg < -90) deg += 180;
  return deg;
}

function routeCenterLatLng(entry) {
  return entry.bounds.getCenter();
}

function routePixelSize(entry) {
  const pts = entry.outer.getLatLngs()[0].map(ll => map.latLngToLayerPoint(ll));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pts.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });
  return { width: Math.max(16, maxX - minX), height: Math.max(8, maxY - minY) };
}

function buildTrainPieceSvg(width, height) {
  const w = Math.max(20, Math.round(width * 0.86));
  const h = Math.max(11, Math.round(height * 0.62));
  const body = '#4f83ee';
  const bodyDark = '#2f5bd3';
  const line = '#1d3577';
  const top = '#7aa7ff';
  const groove = '#355dbf';
  const highlight = '#bcd1ff';
  const wheel = '#2a2119';
  const wheelHi = '#9d7a49';
  const wheelR = Math.max(1.3, h * 0.11);
  const wheelY = h + wheelR * 0.2;
  const wheelXs = [w * 0.18, w * 0.40, w * 0.62, w * 0.84];
  const grooves = [0.16,0.29,0.42,0.56,0.70,0.84].map(frac => {
    const x = (w * frac).toFixed(2);
    return `<line x1="${x}" y1="${(h*0.18).toFixed(2)}" x2="${x}" y2="${(h*0.88).toFixed(2)}" stroke="${groove}" stroke-width="0.95" stroke-linecap="round" opacity="0.92"/>`;
  }).join('');
  const topDots = [0.30, 0.70].map(frac => {
    const x = (w * frac).toFixed(2);
    return `<circle cx="${x}" cy="${(h*0.12).toFixed(2)}" r="${(h*0.06).toFixed(2)}" fill="${line}" opacity="0.55"/>`;
  }).join('');
  const wheels = wheelXs.map(x => `
    <g>
      <circle cx="${x.toFixed(2)}" cy="${wheelY.toFixed(2)}" r="${wheelR.toFixed(2)}" fill="${wheel}"/>
      <circle cx="${x.toFixed(2)}" cy="${wheelY.toFixed(2)}" r="${(wheelR*0.42).toFixed(2)}" fill="${wheelHi}" opacity="0.95"/>
    </g>`).join('');
  return `
    <svg width="${w}" height="${(h + wheelR * 2.4).toFixed(2)}" viewBox="0 0 ${w} ${(h + wheelR * 2.4).toFixed(2)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="${(h*0.05).toFixed(2)}" width="${(w-2).toFixed(2)}" height="${(h*0.88).toFixed(2)}" rx="${(h*0.10).toFixed(2)}" fill="${bodyDark}" stroke="${line}" stroke-width="1.1"/>
      <rect x="${(w*0.06).toFixed(2)}" y="${(h*0.04).toFixed(2)}" width="${(w*0.88).toFixed(2)}" height="${(h*0.16).toFixed(2)}" rx="${(h*0.06).toFixed(2)}" fill="${top}" opacity="0.98"/>
      <line x1="${(w*0.08).toFixed(2)}" y1="${(h*0.22).toFixed(2)}" x2="${(w*0.92).toFixed(2)}" y2="${(h*0.22).toFixed(2)}" stroke="${highlight}" stroke-width="0.85" opacity="0.65"/>
      <rect x="${(w*0.03).toFixed(2)}" y="${(h*0.10).toFixed(2)}" width="${(w*0.94).toFixed(2)}" height="${(h*0.72).toFixed(2)}" rx="${(h*0.09).toFixed(2)}" fill="${body}" opacity="0.70"/>
      ${grooves}
      ${topDots}
      ${wheels}
    </svg>`;
}

function removeTrainOverlay(entry) {
  if (entry.trainMarker) {
    map.removeLayer(entry.trainMarker);
    entry.trainMarker = null;
  }
}

function syncTrainOverlay(entry) {
  removeTrainOverlay(entry);
  if (!map._loaded) return;
  const routeKey = segmentToRouteKey[entry.feature.properties.id];
  if (!isRouteComplete(routeKey)) return;
  const size = routePixelSize(entry);
  const width = Math.max(16, Math.min(64, size.width * 0.74));
  const height = Math.max(8, Math.min(22, size.height * 0.60));
  const angleDeg = routeAngleDegrees(entry.outer.getLatLngs()[0]);
  const svg = buildTrainPieceSvg(width, height);
  const totalH = Math.round(height + Math.max(3, height * 0.40));
  const html = `<div class="train-piece-wrap" style="width:${Math.round(width)}px;height:${totalH}px;transform:rotate(${angleDeg}deg);transform-origin:center center;">${svg}</div>`;
  entry.trainMarker = L.marker(routeCenterLatLng(entry), {
    interactive: false,
    keyboard: false,
    zIndexOffset: 900,
    icon: L.divIcon({ className: '', html, iconSize: [Math.round(width), Math.round(totalH)], iconAnchor: [Math.round(Math.round(width) / 2), Math.round(Math.round(totalH) / 2)] })
  }).addTo(map);
}

function refreshAllTrainOverlays() {
  Object.values(routeLayersById).forEach(syncTrainOverlay);
}

function updateRouteStyle(entry) {
  const feature = entry.feature;
  const id = feature.properties.id;
  const base = feature.properties.baseFill || '#9ca3af';
  const palette = routePalette(base, isClaimed(id), false);

  stylePart(entry.outer, {
    fillColor: palette.outerFill,
    color: palette.outerStroke,
    weight: 2.4,
    fillOpacity: 1,
    lineJoin: 'round'
  }, 'route-box-outer');

  stylePart(entry.inner, {
    fillColor: palette.innerFill,
    color: palette.innerStroke,
    weight: 1.1,
    fillOpacity: 1,
    lineJoin: 'round'
  }, 'route-box-inner');

  if (entry.shine) {
    stylePart(entry.shine, {
      fillColor: palette.shineFill,
      color: 'rgba(255,255,255,0)',
      weight: 0,
      fillOpacity: 1,
      lineJoin: 'round'
    }, 'route-box-shine');
  }
}

function connectionPointsForLength(length) {
  return connectionPointsForLengthModule(length, ROUTE_POINT_VALUES);
}

function isRouteComplete(routeKey) {
  return isRouteCompleteModule(routeKey, routeGroups, gameState);
}

function getCompletedRouteKeys() {
  return getCompletedRouteKeysModule(routeGroups, gameState);
}

function buildClaimedGraph() {
  return buildClaimedGraphModule(routeGroups, gameState);
}

function areCitiesConnected(start, end, graph) {
  return areCitiesConnectedModule(start, end, graph);
}

function computeScores() {
  return computeScoresModule(routeGroups, gameState, ROUTE_POINT_VALUES);
}

function getIncompleteTickets() {
  return getIncompleteTicketsModule(routeGroups, gameState);
}

function getHighlightedStationNames() {
  return getHighlightedStationNamesModule(routeGroups, gameState);
}

function getGuideDestinationsForStation(stationName) {
  return getGuideDestinationsForStationModule(stationName, routeGroups, gameState);
}

function clearStationGuides() {
  return clearStationGuidesModule({
    stationGuideLayerGroup,
    setSelectedGuideStationName: value => { selectedGuideStationName = value; },
    updateStationStyles
  });
}

function drawStationGuidesFrom(stationName) {
  return drawStationGuidesFromModule({
    stationName,
    stationGuideLayerGroup,
    stationCoordsByName,
    getGuideDestinationsForStation,
    setSelectedGuideStationName: value => { selectedGuideStationName = value; },
    updateStationStyles,
    escapeHtml,
    L
  });
}

function handleStationClick(stationName) {
  return handleStationClickModule({
    stationName,
    getHighlightedStationNames,
    selectedGuideStationName,
    clearStationGuides,
    drawStationGuidesFrom
  });
}

function updateStationStyles() {
  return updateStationStylesModule({
    stationLayersByName,
    getHighlightedStationNames,
    selectedGuideStationName
  });
}

function updateStats() {
  const scores = computeScores();
  gameState.connection_points = scores.connectionPoints;
  gameState.ticket_points = scores.ticketPoints;
  gameState.total_points = scores.totalPoints;

  document.getElementById('completedConnections').textContent = scores.completedConnections;
  document.getElementById('connectionScore').textContent = scores.connectionPoints;
  document.getElementById('ticketScore').textContent = scores.ticketPoints;
  document.getElementById('totalScore').textContent = scores.totalPoints;
  document.getElementById('handSummary').textContent = `${gameState.tickets_hand.length} ticket${gameState.tickets_hand.length === 1 ? '' : 's'} kept`;
}

function bindRoutePopup(entry) {
  const props = entry.feature.properties;
  const routeKey = segmentToRouteKey[props.id];
  const group = routeGroups[routeKey];
  const claimed = isClaimed(props.id);
  const connectionComplete = isRouteComplete(routeKey);
  const points = connectionPointsForLength(group.length);
  const offer = getRouteClaimOffer(routeKey);
  const requirementLabel = group.claim_type === 'grey'
    ? 'Any one colour pair, with rainbow wilds allowed'
    : getTrainCardTypeLabel(group.claim_type) + ' with rainbow wilds allowed';
  const availabilityLine = connectionComplete
    ? 'Spent: <strong>' + escapeHtml(describeSpendPlan((gameState.route_claim_costs || {})[routeKey])) + '</strong>'
    : (offer.canAfford
      ? 'Can claim now using: <strong>' + escapeHtml(describeSpendPlan(offer.spendPlan)) + '</strong>'
      : 'Cannot claim yet: <strong>' + escapeHtml(offer.reason || 'Not enough train cars.') + '</strong>');
  const html = `
    <div class="popup-title">${escapeHtml(routeKey)}</div>
    <div>Space: <strong>${claimed ? 'Claimed' : 'Unclaimed'}</strong></div>
    <div>Connection: <strong>${connectionComplete ? 'Complete' : 'Incomplete'}</strong></div>
    <div>Length: ${group.length} train${group.length === 1 ? '' : 's'} · ${points} point${points === 1 ? '' : 's'}</div>
    <div>Requirement: <strong>${escapeHtml(requirementLabel)}</strong></div>
    <div style="margin-top:8px;">${availabilityLine}</div>
    <div style="margin-top:8px;color:#6d4f2c;">Click any space to claim or unclaim the whole connection at once.</div>
  `;
  entry.outer.bindPopup(html);
  entry.inner.bindPopup(html);
  if (entry.shine) entry.shine.bindPopup(html);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function applyStateToVisuals() {
  return controller.renderAll()
}

function toggleRoute(entry) {
  return controller.onToggleRoute(entry);
}

function resetBoard() {
  return controller.onResetBoard();
}

function newGame() {
  return controller.onNewGame();
}

async function persistGameState(reason = 'State saved') {
  updateStats();
  if (!sbClient) {
    setSyncStatus('offline', 'Supabase not available. Running locally only.');
    return;
  }
  const payload = {
    id: GAME_ID,
    name: GAME_NAME,
    claimed_segments: gameState.claimed_segments,
    tickets_deck_remaining: gameState.tickets_deck_remaining,
    tickets_offer: gameState.tickets_offer,
    tickets_hand: gameState.tickets_hand,
    active_challenge: gameState.active_challenge_card ?? null,
    completed_challenges: gameState.completed_challenge_cards ?? [],
    train_store: serializeTrainStore(),
    active_preview_card: getPreviewTrainCard(),
    challenge_deck_remaining: gameState.challenge_deck_remaining ?? [],
    connection_points: gameState.connection_points,
    ticket_points: gameState.ticket_points,
    total_points: gameState.total_points,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await sbClient
    .from('games')
    .upsert(payload)
    .select('updated_at')
    .single();
  if (error) {
    console.error('Failed to save shared game:', error);
    setSyncStatus('offline', error.message || 'Save failed.');
    return;
  }
  lastKnownUpdatedAt = data?.updated_at || payload.updated_at;
  setSyncStatus('online', reason);
}

function queuePersist(reason) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => persistGameState(reason), 200);
}

async function loadGameStateFromServer() {
  if (!sbClient) {
    setSyncStatus('offline', 'Supabase not available. Running locally only.');
    applyStateToVisuals();
    updateDrawControls();
    return;
  }
  setSyncStatus('pending', 'Loading shared game...');
  const { data, error } = await sbClient
    .from('games')
    .select('*')
    .eq('id', GAME_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to load shared game:', error);
    setSyncStatus('offline', error.message || 'Load failed.');
    applyStateToVisuals();
    updateDrawControls();
    return;
  }

  if (!data) {
    gameState = createNewGameState();
    applyStateToVisuals();
    updateDrawControls();
    await persistGameState('Created shared game');
    return;
  }

  gameState = normalizeState(data);
  lastKnownUpdatedAt = data.updated_at || null;
  applyStateToVisuals();
  updateDrawControls();
  setSyncStatus('online', 'Shared game loaded.');
}

async function pollForRemoteUpdates() {
  if (!sbClient || !lastKnownUpdatedAt) return;
  const { data, error } = await sbClient
    .from('games')
    .select('*')
    .eq('id', GAME_ID)
    .single();
  if (error || !data) return;
  if (data.updated_at && data.updated_at !== lastKnownUpdatedAt) {
    lastKnownUpdatedAt = data.updated_at;
    gameState = normalizeState(data);
    applyStateToVisuals();
    updateDrawControls();
    setSyncStatus('online', 'Shared game updated.');
  }
}

document.getElementById('drawTicketsBtn').addEventListener('click', drawTickets);
document.getElementById('keepSelectedBtn').addEventListener('click', keepSelectedTickets);
document.getElementById('resetBoardBtn').addEventListener('click', resetBoard);
document.getElementById('newGameBtn').addEventListener('click', newGame);
const trainCardTrayToggle = document.getElementById('trainCardTrayToggle');
if (trainCardTrayToggle) {
  trainCardTrayToggle.addEventListener('click', toggleTrainCardTray);
}
const leftSidebarToggle = document.getElementById('leftSidebarToggle');
const rightSidebarToggle = document.getElementById('rightSidebarToggle');
if (leftSidebarToggle) {
  leftSidebarToggle.addEventListener('click', () => toggleSidebar('left'));
}
if (rightSidebarToggle) {
  rightSidebarToggle.addEventListener('click', () => toggleSidebar('right'));
}

syncMobileSidebarMode();
applySidebarState();
setTrainCardTrayOpen(false);

initAccordions();
registerRouteGroups({
  routesData,
  routeGroups,
  segmentToRouteKey,
  parseRouteKey,
  parseRouteLength,
  parseRouteEndpoints,
  parseRouteClaimType
});
buildRoutes({
  routesData,
  routeLayerGroup,
  routeLayersById,
  insetPolygon,
  topEdgePolygon,
  updateRouteStyle,
  bindRoutePopup,
  syncTrainOverlay,
  toggleRoute,
  L
});
buildStations({
  stationsData,
  stationLayerGroup,
  stationLayersByName,
  stationCoordsByName,
  handleStationClick,
  updateStationStyles,
  escapeHtml,
  L
});

map.whenReady(async () => {
  map.invalidateSize();
  fitToData({
    map,
    routeLayersById,
    L
  });
  refreshAllTrainOverlays();
  updateStats();
  updateDrawControls();
  await loadGameStateFromServer();
});

map.on('zoomend moveend resize', refreshAllTrainOverlays);
window.addEventListener('resize', () => {
  syncMobileSidebarMode();
  applySidebarState();
  setTimeout(() => {
    map.invalidateSize();
    refreshAllTrainOverlays();
  }, 0);
});
window.addEventListener('focus', pollForRemoteUpdates);
setInterval(pollForRemoteUpdates, 5000);

