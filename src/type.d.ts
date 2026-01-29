type UserRoles = "admin" | "teacher" | "student";

type RateLimitRole = UserRoles | "guest";

export { UserRoles, RateLimitRole };