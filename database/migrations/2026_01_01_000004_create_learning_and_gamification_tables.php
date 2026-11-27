<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_unlocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('unit_id')->constrained('units')->cascadeOnDelete();
            $table->timestamp('unlocked_at');

            $table->unique(['user_id', 'unit_id']);
        });

        Schema::create('learner_lesson_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->integer('completed_content_version')->nullable();
            $table->decimal('best_score', 5, 2)->nullable();
            $table->enum('status', ['in_progress', 'completed'])->default('in_progress');
            $table->timestamp('completed_at')->nullable();

            $table->unique(['user_id', 'lesson_id']);
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('quiz_id')->constrained('unit_quizzes')->cascadeOnDelete();
            $table->integer('attempt_number');
            $table->decimal('score', 5, 2)->nullable();
            $table->enum('status', ['in_progress', 'passed', 'failed'])->default('in_progress');
            $table->integer('content_version');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
        });

        Schema::create('quiz_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->json('response_data');
            $table->boolean('is_correct');
            $table->decimal('earned_points', 6, 2);
            $table->timestamp('submitted_at');

            $table->unique(['attempt_id', 'question_id']);
        });

        Schema::create('remedial_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('quiz_attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->integer('error_count');
            $table->integer('priority_order');
            $table->integer('content_version');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->timestamp('created_at');
            $table->timestamp('completed_at')->nullable();
        });

        Schema::create('lesson_activity_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignUuid('activity_id')->constrained('lesson_activities')->cascadeOnDelete();
            $table->enum('progress_type', ['regular', 'remedial'])->default('regular');
            $table->foreignUuid('remedial_assignment_id')->nullable()->constrained('remedial_assignments')->cascadeOnDelete();
            $table->enum('status', ['not_started', 'completed'])->default('not_started');
            $table->timestamp('completed_at')->nullable();
        });

        Schema::create('lesson_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->enum('attempt_type', ['regular', 'remedial'])->default('regular');
            $table->foreignUuid('remedial_assignment_id')->nullable()->constrained('remedial_assignments')->cascadeOnDelete();
            $table->integer('attempt_number');
            $table->decimal('score', 5, 2)->nullable();
            $table->enum('status', ['in_progress', 'passed', 'failed'])->default('in_progress');
            $table->integer('content_version');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
        });

        Schema::create('lesson_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('lesson_attempts')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('lesson_questions')->cascadeOnDelete();
            $table->json('response_data');
            $table->boolean('is_correct');
            $table->decimal('earned_points', 6, 2);
            $table->timestamp('submitted_at');

            $table->unique(['attempt_id', 'question_id']);
        });

        Schema::create('xp_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->enum('activity_type', ['lesson', 'remedial', 'quiz']);
            $table->uuid('reference_id');
            $table->integer('xp_amount');
            $table->timestamp('created_at');

            $table->unique(['user_id', 'activity_type', 'reference_id']);
        });

        Schema::create('badges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 100)->unique();
            $table->string('name', 150);
            $table->text('description');
            $table->string('icon', 100);
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('badge_id')->constrained('badges')->cascadeOnDelete();
            $table->timestamp('awarded_at');

            $table->unique(['user_id', 'badge_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('xp_transactions');
        Schema::dropIfExists('lesson_responses');
        Schema::dropIfExists('lesson_attempts');
        Schema::dropIfExists('lesson_activity_progress');
        Schema::dropIfExists('remedial_assignments');
        Schema::dropIfExists('quiz_responses');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('learner_lesson_progress');
        Schema::dropIfExists('unit_unlocks');
    }
};
