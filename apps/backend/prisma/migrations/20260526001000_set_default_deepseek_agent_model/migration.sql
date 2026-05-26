ALTER TABLE "Agent" ALTER COLUMN "model" SET DEFAULT 'deepseek-v4-flash';

UPDATE "Agent"
SET "model" = 'deepseek-v4-flash'
WHERE "model" = 'gpt-4o-mini';
