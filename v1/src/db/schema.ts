import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const author = pgTable("author", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  displayName: text("display_name"),
  avatar: text("avatar"),
  bio: text("bio"),

  isPublic: boolean("is_public").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const blog = pgTable(
  "blog",
  {
    id: text("id").primaryKey(),

    authorId: text("author_id")
      .notNull()
      .references(() => author.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),

    content: text("content").notNull(),

    visibility: text("visibility", {
      enum: ["private", "unlisted", "public"],
    }).notNull(),

    allowComments: boolean("allow_comments").default(true).notNull(),

    isDraft: boolean("is_draft").default(true).notNull(),

    readingTime: text("reading_time"), // e.g. "5 min read"

    isAnonymous: boolean("is_anonymous").default(false).notNull(),

    views: text("views").default("0"),

    tsv: text("tsv"), // tsvector

    isPinned: boolean("is_pinned").default(false).notNull(),

    deletedAt: timestamp("deleted_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("blog_author_idx").on(table.authorId),
    index("blog_slug_idx").on(table.slug),
  ]
)

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
})

export const blogTag = pgTable("blog_tag", {
  blogId: text("blog_id")
    .notNull()
    .references(() => blog.id, { onDelete: "cascade" }),

  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
})

export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),

    blogId: text("blog_id")
      .notNull()
      .references(() => blog.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    parentId: text("parent_id"), // nesting

    content: text("content").notNull(),

    isHidden: boolean("is_hidden").default(false).notNull(),

    isEdited: boolean("is_edited").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("comment_blog_idx").on(table.blogId),
    index("comment_parent_idx").on(table.parentId),
  ]
)

export const blogVersion = pgTable("blog_version", {
  id: text("id").primaryKey(),

  blogId: text("blog_id")
    .notNull()
    .references(() => blog.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const blogView = pgTable("blog_view", {
  id: text("id").primaryKey(),

  blogId: text("blog_id")
    .notNull()
    .references(() => blog.id, { onDelete: "cascade" }),

  userId: text("user_id"), // nullable
  sessionId: text("session_id"), // for anonymous tracking

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const blockedUser = pgTable(
  "blocked_user",
  {
    id: text("id").primaryKey(),
    blockerId: text("blocker_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blogId: text("blog_id").references(() => blog.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("blocked_blocker_idx").on(table.blockerId),
    index("blocked_blocked_idx").on(table.blockedId),
    index("blocked_blog_idx").on(table.blogId),
  ]
)

// == RELATIONS ==

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  authorProfile: one(author, {
    fields: [user.id],
    references: [author.userId],
  }),
  comments: many(comment),
  blocksInitiated: many(blockedUser, { relationName: "blocksInitiated" }),
  blocksReceived: many(blockedUser, { relationName: "blocksReceived" }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const authorRelations = relations(author, ({ one, many }) => ({
  user: one(user, {
    fields: [author.userId],
    references: [user.id],
  }),
  blogs: many(blog),
}))

export const blogRelations = relations(blog, ({ one, many }) => ({
  author: one(author, {
    fields: [blog.authorId],
    references: [author.id],
  }),
  tags: many(blogTag),
  comments: many(comment),
  versions: many(blogVersion),
  views: many(blogView),
  blocks: many(blockedUser),
}))

export const tagRelations = relations(tag, ({ many }) => ({
  blogs: many(blogTag),
}))

export const blogTagRelations = relations(blogTag, ({ one }) => ({
  blog: one(blog, {
    fields: [blogTag.blogId],
    references: [blog.id],
  }),
  tag: one(tag, {
    fields: [blogTag.tagId],
    references: [tag.id],
  }),
}))

export const commentRelations = relations(comment, ({ one, many }) => ({
  blog: one(blog, {
    fields: [comment.blogId],
    references: [blog.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "commentReplies"
  }),
  replies: many(comment, {
    relationName: "commentReplies"
  }),
}))

export const blogVersionRelations = relations(blogVersion, ({ one }) => ({
  blog: one(blog, {
    fields: [blogVersion.blogId],
    references: [blog.id],
  }),
}))

export const blogViewRelations = relations(blogView, ({ one }) => ({
  blog: one(blog, {
    fields: [blogView.blogId],
    references: [blog.id],
  }),
}))

export const blockedUserRelations = relations(blockedUser, ({ one }) => ({
  blocker: one(user, {
    fields: [blockedUser.blockerId],
    references: [user.id],
    relationName: "blocksInitiated",
  }),
  blocked: one(user, {
    fields: [blockedUser.blockedId],
    references: [user.id],
    relationName: "blocksReceived",
  }),
  blog: one(blog, {
    fields: [blockedUser.blogId],
    references: [blog.id],
  }),
}))