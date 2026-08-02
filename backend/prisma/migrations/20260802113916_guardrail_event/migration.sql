-- CreateTable
CREATE TABLE "GuardrailEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ruleTriggered" TEXT NOT NULL,
    "contentSnippet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardrailEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuardrailEvent" ADD CONSTRAINT "GuardrailEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
