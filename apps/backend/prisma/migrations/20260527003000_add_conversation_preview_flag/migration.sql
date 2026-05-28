ALTER TABLE "Conversation" ADD COLUMN "isPreview" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Conversation_agentId_userId_isPreview_idx" ON "Conversation"("agentId", "userId", "isPreview");
