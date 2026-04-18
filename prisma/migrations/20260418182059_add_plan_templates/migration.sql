-- CreateTable
CREATE TABLE "PlanTemplate" (
    "id" TEXT NOT NULL,
    "bhkType" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "facing" TEXT NOT NULL,
    "plotWidth" DOUBLE PRECISION NOT NULL,
    "plotHeight" DOUBLE PRECISION NOT NULL,
    "plotUnit" TEXT NOT NULL DEFAULT 'ft',
    "rooms" JSONB NOT NULL,
    "vastuScore" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTemplate_pkey" PRIMARY KEY ("id")
);
