ALTER TABLE "chirps" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "hashed_password" varchar DEFAULT 'unset' NOT NULL;