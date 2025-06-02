import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameCode: text("game_code").notNull().unique(),
  hostId: text("host_id").notNull(),
  maxPlayers: integer("max_players").notNull().default(8),
  winningScore: integer("winning_score").notNull().default(5),
  currentRound: integer("current_round").notNull().default(1),
  currentJudgeIndex: integer("current_judge_index").notNull().default(0),
  gamePhase: text("game_phase").notNull().default("setup"), // setup, playing, judging, results, ended
  questionCard: jsonb("question_card"),
  submittedAnswers: jsonb("submitted_answers").default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id),
  name: text("name").notNull(),
  sessionId: text("session_id").notNull(),
  score: integer("score").notNull().default(0),
  hand: jsonb("hand").default([]), // Array of answer cards
  isJudge: boolean("is_judge").notNull().default(false),
  hasSubmitted: boolean("has_submitted").notNull().default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const questionCards = pgTable("question_cards", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  blanks: integer("blanks").notNull().default(1),
  category: text("category").default("general"),
});

export const answerCards = pgTable("answer_cards", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").default("general"),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  gameCode: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  joinedAt: true,
});

export const insertQuestionCardSchema = createInsertSchema(questionCards).omit({
  id: true,
});

export const insertAnswerCardSchema = createInsertSchema(answerCards).omit({
  id: true,
});

export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;
export type QuestionCard = typeof questionCards.$inferSelect;
export type AnswerCard = typeof answerCards.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertQuestionCard = z.infer<typeof insertQuestionCardSchema>;
export type InsertAnswerCard = z.infer<typeof insertAnswerCardSchema>;
