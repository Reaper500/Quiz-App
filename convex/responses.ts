import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save a response
export const saveResponse = mutation({
  args: {
    formId: v.id("forms"),
    responses: v.any(),
    submittedAt: v.string(),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    answers: v.optional(v.any()),
    studentName: v.optional(v.string()),
    studentClass: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("responses", {
      formId: args.formId,
      responses: args.responses,
      submittedAt: args.submittedAt,
      score: args.score,
      maxScore: args.maxScore,
      answers: args.answers,
      studentName: args.studentName,
      studentClass: args.studentClass,
    });
  },
});

// Get responses for a form
export const getResponses = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("responses")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .collect();
  },
});

// Get all responses (for admin)
export const getAllResponses = query({
  handler: async (ctx) => {
    return await ctx.db.query("responses").collect();
  },
});
