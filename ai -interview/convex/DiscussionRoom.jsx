import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ✅ Mutation to create new room
export const CreateNewRoom = mutation({
  args: {
    aiExpertList: v.string(),
    topic: v.string(),
    expertName: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("DiscussionRoom", {
      aiExpertList: args.aiExpertList,
      topic: args.topic,
      expertName: args.expertName,
    });
    return result;
  }
});

// ✅ Query to get a discussion room
export const GetDiscussionRoom = query({
  args: {
    id: v.id("DiscussionRoom"), // 🛠️ Use table name as string
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.id);
    return result;
  }
});
