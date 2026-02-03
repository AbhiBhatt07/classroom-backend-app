import { relations } from "drizzle-orm";
import {
 integer,
 jsonb,
 pgEnum,
 pgTable,
 text,
 timestamp,
 unique,
 varchar,
 index,
 primaryKey,
} from "drizzle-orm/pg-core";

import { user } from "./auth.js";

export const classStatusEnum = pgEnum("class_status", [
 "active",
 "inactive",
 "archived",
]);

const timestamps = {
 createdAt: timestamp("created_at").defaultNow().notNull(),
 updatedAt: timestamp("updated_at")
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull(),
};

// Tables
export const departments = pgTable("departments", {
 id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
 code: varchar("code", { length: 50 }).notNull().unique(),
 name: varchar("name", { length: 255 }).notNull(),
 description: varchar("description", { length: 255 }),
 ...timestamps,
});

export const subjects = pgTable("subjects", {
 id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
 departmentId: integer("department_id")
  .notNull()
  .references(() => departments.id, { onDelete: "restrict" }),
 name: varchar("name", { length: 255 }).notNull(),
 code: varchar("code", { length: 50 }).notNull().unique(),
 description: varchar("description", { length: 255 }),
 ...timestamps,
});

export const classes = pgTable(
 "classes",
 {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  subjectId: integer("subject_id")
   .notNull()
   .references(() => subjects.id, { onDelete: "cascade" }),
  teacherId: text("teacher_id")
   .notNull()
   .references(() => user.id, { onDelete: "restrict" }),
  inviteCode: text("invite_code").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  bannerCldPubId: text("banner_cld_pub_id"),
  bannerUrl: text("banner_url"),
  description: text("description"),
  capacity: integer("capacity").default(50).notNull(),
  status: classStatusEnum("status").default("active").notNull(),
  schedules: jsonb("schedules").$type<any[]>().default([]).notNull(),
  ...timestamps,
 },
 (table) => [
  index("classes_subject_id_idx").on(table.subjectId),
  index("classes_teacher_id_idx").on(table.teacherId),
 ],
);

export const enrollments = pgTable('enrollments', {
  studentId: text("student_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  classId: integer('class_id').notNull().references(() => classes.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({columns: [table.studentId, table.classId]}),
  unique('enrollments_student_id_class_id_unique').on(table.studentId, table.classId),
  index('enrollments_student_id_idx').on(table.studentId),
  index('enrollments_class_id_idx').on(table.classId)
])


// Relation between departments and subjects using many to many
export const departmentRelations = relations(departments, ({ many }) => ({
 subjects: many(subjects),
}));

// Relation between subjects and departments using one to one & one to many
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
 department: one(departments, {
  fields: [subjects.departmentId],
  references: [departments.id],
 }),
 classes: many(classes)
}));


export const classessRelations = relations(classes, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }), 
  teacher: one(user, {
    fields: [classes.teacherId],
    references: [user.id],
  }),
  enrollments: many(enrollments)
}));


export const enrollmentsRelations = relations(enrollments, ({one}) => ({
  student: one(user, {
    fields: [enrollments.studentId],
    references: [user.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}));

// Types for each table because drizzle-orm is not type safe
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Subjects = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Classes = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Enrollments = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
