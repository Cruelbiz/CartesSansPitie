// French card data for the game
export const QUESTION_CARDS = [
  {
    id: 1,
    text: "La chose la plus embarrassante que j'ai faite pour _____ c'est _____.",
    blanks: 2,
    category: "general"
  },
  {
    id: 2,
    text: "_____ + _____ = le combo parfait pour ruiner une soirée.",
    blanks: 2,
    category: "general"
  },
  {
    id: 3,
    text: "Maman, pourquoi il y a _____ dans mon _____ ?",
    blanks: 2,
    category: "general"
  },
  {
    id: 4,
    text: "_____ : c'est ce qui manquait à ma vie pour être vraiment pathétique.",
    blanks: 1,
    category: "general"
  },
  {
    id: 5,
    text: "Comment j'ai découvert que _____ et _____ ne font pas bon ménage.",
    blanks: 2,
    category: "general"
  },
  {
    id: 6,
    text: "Mon pire cauchemar ? _____.",
    blanks: 1,
    category: "general"
  },
  {
    id: 7,
    text: "Le secret de ma réussite ? _____.",
    blanks: 1,
    category: "general"
  },
  {
    id: 8,
    text: "_____ : parfait pour impressionner belle-maman.",
    blanks: 1,
    category: "general"
  },
  {
    id: 9,
    text: "Qu'est-ce qui rend _____ si irrésistible ?",
    blanks: 1,
    category: "general"
  },
  {
    id: 10,
    text: "Lors de mon dernier rendez-vous galant, j'ai été surpris par _____.",
    blanks: 1,
    category: "general"
  }
];

export const ANSWER_CARDS = [
  { id: 1, text: "de l'argent et ma dignité", category: "general" },
  { id: 2, text: "mes économies", category: "general" },
  { id: 3, text: "un pingouin unijambiste", category: "general" },
  { id: 4, text: "pleurer en position fœtale", category: "general" },
  { id: 5, text: "ma belle-mère en maillot de bain", category: "general" },
  { id: 6, text: "une vidéo YouTube qui dure 3 heures", category: "general" },
  { id: 7, text: "faire semblant d'être un expert", category: "general" },
  { id: 8, text: "des chaussettes sales", category: "general" },
  { id: 9, text: "mon ex en réunion Zoom", category: "general" },
  { id: 10, text: "un sandwich au nutella périmé", category: "general" },
  { id: 11, text: "danser nu devant mon miroir", category: "general" },
  { id: 12, text: "mes photos de profil Tinder", category: "general" },
  { id: 13, text: "un cours de yoga pour chats", category: "general" },
  { id: 14, text: "mes recherches Google à 3h du matin", category: "general" },
  { id: 15, text: "mon patron en slip de bain", category: "general" },
  { id: 16, text: "une collection de figurines de licornes", category: "general" },
  { id: 17, text: "des tacos qui se battent", category: "general" },
  { id: 18, text: "une licorne dépressive", category: "general" },
  { id: 19, text: "des pâtes qui parlent", category: "general" },
  { id: 20, text: "le WiFi de ma grand-mère", category: "general" },
  { id: 21, text: "un chat en costard", category: "general" },
  { id: 22, text: "ma dignité perdue", category: "general" },
  { id: 23, text: "des chaussettes qui sentent le fromage", category: "general" },
  { id: 24, text: "une moustache de hipster", category: "general" },
  { id: 25, text: "mon ex qui mange des céréales", category: "general" },
  { id: 26, text: "un tatouage de ma grand-mère", category: "general" },
  { id: 27, text: "pleurer en regardant des vidéos de chatons", category: "general" },
  { id: 28, text: "mon historique de recherche Google", category: "general" },
  { id: 29, text: "une passion secrète pour les romans à l'eau de rose", category: "general" },
  { id: 30, text: "mentionner mon ex 47 fois pendant le repas", category: "general" },
];

export const GAME_PHASES = {
  SETUP: "setup",
  PLAYING: "playing",
  JUDGING: "judging",
  RESULTS: "results",
  ENDED: "ended",
} as const;

export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];
