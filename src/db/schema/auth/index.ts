import { pgSchema, uuid, text } from "drizzle-orm/pg-core";

const auth = pgSchema("auth");

const authUsers = auth.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"), // facultatif ici, uniquement si utile en SELECT
});
