/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('kakao', 'apple', 'naver');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'unknown');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'member');

-- CreateEnum
CREATE TYPE "FeedingType" AS ENUM ('breast', 'formula', 'solid');

-- CreateEnum
CREATE TYPE "FeedingSide" AS ENUM ('left', 'right', 'both');

-- CreateEnum
CREATE TYPE "DiaperType" AS ENUM ('pee', 'poo', 'both');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "tb_user" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "provider" "Provider",
    "is_anonymous" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_baby" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_baby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_baby_member" (
    "id" UUID NOT NULL,
    "baby_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_baby_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_feeding_record" (
    "id" UUID NOT NULL,
    "baby_id" UUID NOT NULL,
    "type" "FeedingType" NOT NULL,
    "side" "FeedingSide",
    "amount_ml" INTEGER,
    "start_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),

    CONSTRAINT "tb_feeding_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_sleep_record" (
    "id" UUID NOT NULL,
    "baby_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),

    CONSTRAINT "tb_sleep_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_diaper_record" (
    "id" UUID NOT NULL,
    "baby_id" UUID NOT NULL,
    "type" "DiaperType" NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_diaper_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_user_provider_email_key" ON "tb_user"("provider", "email");

-- CreateIndex
CREATE INDEX "tb_baby_member_user_id_idx" ON "tb_baby_member"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_baby_member_baby_id_user_id_key" ON "tb_baby_member"("baby_id", "user_id");

-- CreateIndex
CREATE INDEX "tb_feeding_record_baby_id_start_time_idx" ON "tb_feeding_record"("baby_id", "start_time");

-- CreateIndex
CREATE INDEX "tb_sleep_record_baby_id_start_time_idx" ON "tb_sleep_record"("baby_id", "start_time");

-- CreateIndex
CREATE INDEX "tb_diaper_record_baby_id_recorded_at_idx" ON "tb_diaper_record"("baby_id", "recorded_at");

-- AddForeignKey
ALTER TABLE "tb_baby_member" ADD CONSTRAINT "tb_baby_member_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "tb_baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_baby_member" ADD CONSTRAINT "tb_baby_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_feeding_record" ADD CONSTRAINT "tb_feeding_record_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "tb_baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_sleep_record" ADD CONSTRAINT "tb_sleep_record_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "tb_baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_diaper_record" ADD CONSTRAINT "tb_diaper_record_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "tb_baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
