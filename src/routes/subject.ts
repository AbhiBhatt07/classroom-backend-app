import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// Get all subjects with optional search, filtering and pegination
router.get("/", async (req, res) => {
  try {
    // Read query parameters with defaults for pagination
    const { search, department, page = 1, limit = 10 } = req.query;

    // Normalize pagination values
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);

    // Collect dynamic filter conditions
    const filterConditions = [];

    // Search by subject name or code
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }

    // Filter by department name
    if (department) {
      filterConditions.push(
        ilike(departments.name, `%${department}%`)
      );
    }

    // Combine filters if any exist
    const whereClause =
      filterConditions.length ? and(...filterConditions) : undefined;

    // Get total record count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    // Fetch paginated subject data
    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: {
          ...getTableColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset((currentPage - 1) * limitPerPage);

    // Return data with pagination metadata
    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });

  } catch (error) {
    // Handle unexpected server or database errors
    console.error("GET /subject error:", error);
    res.status(500).json({
      error: "Failed to fetch subjects",
    });
  }
});



export default router;