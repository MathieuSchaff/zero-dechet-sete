import { relations } from "drizzle-orm";
import { profiles } from "./profiles";
import { article, articleRevision } from "./article";
import { post, message } from "./posting";
import { event } from "./event";
import { place } from "./place";

export const profilesRelations = relations(profiles, ({ many }) => ({
  articles: many(article),
  createdRevisions: many(articleRevision),
  posts: many(post),
  sentMessages: many(message, { relationName: "from" }),
  receivedMessages: many(message, { relationName: "to" }),
  events: many(event),
}));

export const articleRelations = relations(article, ({ one, many }) => ({
  author: one(profiles, {
    fields: [article.authorId],
    references: [profiles.id],
  }),
  revisions: many(articleRevision),
}));

export const articleRevisionRelations = relations(
  articleRevision,
  ({ one }) => ({
    article: one(article, {
      fields: [articleRevision.articleId],
      references: [article.id],
    }),
    createdBy: one(profiles, {
      fields: [articleRevision.createdBy],
      references: [profiles.id],
    }),
  })
);

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(profiles, {
    fields: [post.authorId],
    references: [profiles.id],
  }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  post: one(post, {
    fields: [message.postId],
    references: [post.id],
  }),
  from: one(profiles, {
    fields: [message.fromUser],
    references: [profiles.id],
    relationName: "from",
  }),
  to: one(profiles, {
    fields: [message.toUser],
    references: [profiles.id],
    relationName: "to",
  }),
}));

export const eventRelations = relations(event, ({ one }) => ({
  place: one(place, {
    fields: [event.placeId],
    references: [place.id],
  }),
  createdBy: one(profiles, {
    fields: [event.createdBy],
    references: [profiles.id],
  }),
}));
