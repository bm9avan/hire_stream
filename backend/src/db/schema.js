import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  jsonb,
  numeric,
  // pgEnum,
  pgTable,
  real,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// // Enums
// const userRoleEnum = pgEnum("user_role", [
//   "admin",
//   "placement-staff",
//   "department-staff",
//   "viewer",
//   "student",
// ]);
// const jobTypeEnum = pgEnum("job_type", ["internship", "full-time", "both"]);
// const applicationStatusEnum = pgEnum("application_status", [
//   "applied",
//   "online-assessment",
//   "shortlisted", removed
//   "waitlist", removed
//   "interview",
//   "selected",
//   "rejected",
// ]);

// Tables
export const users = pgTable("users", {
  uid: varchar("uid", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  dob: date("dob").notNull(),
  phoneNo: bigint("phone_no", { mode: "number" }).unique().notNull(),
  collegeId: varchar("college_id", { length: 20 })
    .notNull()
    .references(() => colleges.collegeId),
  branchId: varchar("branch_id", { length: 20 }).references(
    () => branches.branchId
  ),
  role: varchar("role", { length: 255 }).default("student").notNull(),
  verified: boolean("verified").notNull().default(false),
  batch: varchar("batch", { length: 255 }),
  cgpa: real("cgpa"),
  resumeLink: varchar("resume_link", { length: 1024 }),
  description: text("description"),
  profileImageUrl: varchar("profile_image_url", { length: 1024 }).default(
    "https://cdn-icons-png.flaticon.com/512/9512/9512683.png"
  ),
  companies: jsonb("companies", { length: 1024 }),
});

export const branches = pgTable("branches", {
  branchId: varchar("branch_id", { length: 20 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

export const colleges = pgTable("colleges", {
  collegeId: varchar("college_id", { length: 20 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 1024 }),
});

// export const requests = pgTable("requests", {
//   id: serial("id").primaryKey(),
//   uid: varchar("uid", { length: 20 })
//     .notNull()
//     .references(() => users.uid),
//   collegeId: varchar("college_id", { length: 20 })
//     .notNull()
//     .references(() => colleges.collegeId),
//   branchId: varchar("branch_id", { length: 20 })
//     .notNull()
//     .references(() => branches.branchId),
//   createdAt: date("created_at").defaultNow(),
// });

export const companies = pgTable("companies", {
  // id: serial("id").primaryKey(),
  // id: uuid("id").defaultRandom().primaryKey().notNull(),
  companyId: varchar("company_id", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 1024 }),
  questions: jsonb("questions", { length: 1024 }),
});

export const resumes = pgTable("resumes", {
  // id: serial("id").primaryKey(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  uid: varchar("uid", { length: 20 })
    .notNull()
    .references(() => users.uid),
  data: text("data"),
  isActive: boolean("is_active").notNull(),
});

export const reviews = pgTable("reviews", {
  // id: serial("id").primaryKey(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  collegeId: varchar("college_id", { length: 20 })
    .notNull()
    .references(() => colleges.collegeId),
  companyId: varchar("company_id", { length: 20 })
    .notNull()
    .references(() => companies.companyId),
  uid: varchar("uid", { length: 20 })
    .notNull()
    .references(() => users.uid),
  review: text("review"),
  createdAt: date("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  // id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 20 }).unique().notNull(),
  collegeId: varchar("college_id", { length: 20 })
    .notNull()
    .references(() => colleges.collegeId),
  companyId: varchar("company_id", { length: 20 })
    .notNull()
    .references(() => companies.companyId, { onDelete: "cascade" }),
  role: varchar("role", { length: 255 }).notNull(),
  deadline: date("deadline").notNull(), //apply deadline
  skills: text("skills"),
  description: text("description"),
  jdPdfLink: varchar("jd_pdf_link", { length: 1024 }),
  batch: varchar("batch", { length: 255 }), //2025
  jobType: varchar("job_type", { length: 255 }).default("both").notNull(), //("job_type", ["internship", "full-time", "both"]);
  status: varchar("status", { length: 255 }).default("OPEN").notNull(), //("status", ["OPEN", "ONLINE_ASSESSMENT", "INTERVIEW", "CLOSED"]);
  statusDate: date("status_date"), //date of event, for open jobs we tell apply deadline, for online-assessment we tell date of online assessment, for interview we tell date of interview. if those values are null, the date of perticuler status yet to announce
  branches: varchar("branches", { length: 1024 }),
  createdAt: date("created_at").defaultNow(),
  webinarRequested: numeric("webinar_requested").default(0),
  cgpa: real("cgpa"),
  lpa: real("lpa"),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  jobId: varchar("job_id", { length: 20 })
    .notNull()
    .references(() => jobs.jobId, { onDelete: "cascade" }),
  uid: varchar("uid", { length: 20 })
    .notNull()
    .references(() => users.uid, { onDelete: "cascade" }),
  currentStatus: varchar("current_status", { length: 255 })
    .default("applied")
    .notNull(),
  updatedAt: date("updated_at").defaultNow(),
  createdAt: date("created_at").defaultNow(),
});

export const mockInterview = pgTable("mockInterview", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  jsonMockResp: jsonb("jsonMockResp").notNull(),
  jobId: varchar("job_id", { length: 20 })
    .notNull()
    .references(() => jobs.jobId, { onDelete: "cascade" }),
  uid: varchar("uid", { length: 20 })
    .notNull()
    .references(() => users.uid, { onDelete: "cascade" }),
  createdAt: date("created_at").defaultNow(),
});

export const userAnswer = pgTable("userAnswer", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  mockId: uuid("mock_id")
    .notNull()
    .references(() => mockInterview.id, { onDelete: "cascade" }),
  question: varchar("question", { length: 255 }).notNull(),
  correctAns: jsonb("correctAns"),
  userAns: jsonb("userAns"),
  feedback: jsonb("feedback"),
  rating: real("rating"),
  uid: varchar("uid", { length: 20 })
    .notNull()
    .references(() => users.uid, { onDelete: "cascade" }),
  createdAt: date("created_at").defaultNow(),
});

// export const mockInterviews = pgTable("mock_interviews", {
//   id: serial("id").primaryKey(),
//   uid: varchar("uid", { length: 20 })
//     .notNull()
//     .references(() => users.uid),
//   questions: text("questions").notNull(),
//   response: text("response"),
//   feedback: text("feedback"),
//   createdAt: date("created_at").defaultNow(),
// });

// // Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.collegeId],
  }),
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.branchId],
  }),
  applications: many(applications),
  // requests: one(requests),
}));

export const mockInterviewsRelations = relations(mockInterview, ({ one }) => ({
  job: one(jobs, {
    fields: [mockInterview.jobId],
    references: [jobs.jobId],
  }),
  user: one(users, {
    fields: [mockInterview.uid],
    references: [users.uid],
  }),
}));

// export const requestsRelations = relations(requests, ({ one }) => ({
//   branch: one(branches, {
//     fields: [requests.branchId], // Field in `requests`
//     references: [branches.branchId], // Field in `branches`
//   }),
//   college: one(colleges, {
//     fields: [requests.collegeId], // Field in `requests`
//     references: [colleges.collegeId], // Field in `colleges`
//   }),
//   user: one(users, {
//     fields: [requests.uid], // Field in `requests`
//     references: [users.uid], // Field in `users`
//   }),
// }));

export const collegesRelations = relations(colleges, ({ many }) => ({
  users: many(users),
  // requests: many(requests),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  // requests: many(requests),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  college: one(colleges, {
    fields: [jobs.collegeId],
    references: [colleges.collegeId],
  }),
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.companyId],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.uid],
    references: [users.uid],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.jobId],
  }),
}));

// export const reviewsRelations = relations(reviews, ({ one }) => ({
//   college: one(colleges, {
//     fields: [reviews.collegeId],
//     references: [colleges.collegeId],
//   }),
//   company: one(companies, {
//     fields: [reviews.companyId],
//     references: [companies.companyId],
//   }),
// }));
