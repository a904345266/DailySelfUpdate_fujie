-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" UUID NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "voice_enabled" BOOLEAN NOT NULL DEFAULT true,
    "voice_language" TEXT NOT NULL DEFAULT 'zh-CN',
    "reminder_morning" TEXT NOT NULL DEFAULT '08:00',
    "reminder_noon" TEXT NOT NULL DEFAULT '12:00',
    "reminder_evening" TEXT NOT NULL DEFAULT '21:00',
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,
    "time_spent" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "follow_up_action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "friend_name" TEXT NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "partner_name" TEXT NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gratitude_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "impact_level" INTEGER NOT NULL,
    "photo_url" TEXT,
    "location_latitude" DECIMAL(10,8),
    "location_longitude" DECIMAL(11,8),
    "location_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reflections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "morning_goal" TEXT,
    "morning_mood" TEXT,
    "noon_check" TEXT,
    "noon_progress" INTEGER,
    "evening_reflection" TEXT,
    "evening_achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evening_challenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "overall_rating" INTEGER,
    "sleep_prediction" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_summaries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_start" DATE NOT NULL,
    "week_end" DATE NOT NULL,
    "work_analysis" JSONB NOT NULL,
    "relationship_analysis" JSONB NOT NULL,
    "gratitude_analysis" JSONB NOT NULL,
    "emotional_analysis" JSONB NOT NULL,
    "growth_tracking" JSONB,
    "ai_recommendations" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "work_records_user_id_date_idx" ON "work_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "friend_records_user_id_date_idx" ON "friend_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "partner_records_user_id_date_idx" ON "partner_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "gratitude_records_user_id_date_idx" ON "gratitude_records"("user_id", "date");

-- CreateIndex
CREATE INDEX "daily_reflections_user_id_date_idx" ON "daily_reflections"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reflections_user_id_date_key" ON "daily_reflections"("user_id", "date");

-- CreateIndex
CREATE INDEX "weekly_summaries_user_id_week_start_idx" ON "weekly_summaries"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_summaries_user_id_week_start_key" ON "weekly_summaries"("user_id", "week_start");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_records" ADD CONSTRAINT "work_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_records" ADD CONSTRAINT "friend_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_records" ADD CONSTRAINT "partner_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gratitude_records" ADD CONSTRAINT "gratitude_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reflections" ADD CONSTRAINT "daily_reflections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_summaries" ADD CONSTRAINT "weekly_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
