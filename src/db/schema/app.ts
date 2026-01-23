import { relations } from "drizzle-orm";
import { timestamp } from "drizzle-orm/gel-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


const timeStamp = {
  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}

// Tables 
export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", {length: 50}).notNull().unique(),
  name: varchar("name", {length:255}).notNull(),
  description: varchar("description", {length:255}),

})

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  departmentId: integer("department_id").notNull().references(() => departments.id, {onDelete: 'restrict'}),
  name: varchar("name", {length:255}).notNull(),
  code: varchar("code", {length: 50}).notNull().unique(),
  description: varchar("description", {length:255}),

})

// Relation between departments and subjects using many to many 
export const departmentRelations = relations(departments, ({ many }) => ({ subjects: many(subjects)}));

// Relation between subjects and departments using one to one & one to many 
export const subjectsRelations = relations(subjects, ({one, many}) => ({
   department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id]
   })
}))
 
// Types for each table because drizzle-orm is not type safe
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Subjects = typeof departments.$inferSelect;
export type NewSubject = typeof departments.$inferInsert;

