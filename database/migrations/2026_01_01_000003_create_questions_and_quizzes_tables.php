<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('activity_id')->constrained('lesson_activities')->cascadeOnDelete();
            $table->enum('question_type', ['mc_pasan_to_id', 'mc_id_to_pasan', 'matching', 'fill_blank']);
            $table->text('question_text');
            $table->json('question_data');
            $table->text('explanation')->nullable();
            $table->decimal('points', 6, 2)->default(10.00);
            $table->integer('order_number')->default(1);
        });

        Schema::create('lesson_question_answer_keys', function (Blueprint $table) {
            $table->foreignUuid('question_id')->primary()->constrained('lesson_questions')->cascadeOnDelete();
            $table->json('answer_key');
        });

        Schema::create('unit_quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->unique()->constrained('units')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->decimal('passing_score', 5, 2)->default(75.00);
            $table->integer('content_version')->default(1);
            $table->enum('status', ['draft', 'pending_review', 'changes_requested', 'approved', 'published'])->default('draft');
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quiz_id')->constrained('unit_quizzes')->cascadeOnDelete();
            $table->foreignUuid('primary_lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->enum('question_type', ['mc_pasan_to_id', 'mc_id_to_pasan', 'matching', 'fill_blank']);
            $table->text('question_text');
            $table->json('question_data');
            $table->text('explanation')->nullable();
            $table->decimal('points', 6, 2)->default(10.00);
            $table->integer('order_number')->default(1);
        });

        Schema::create('quiz_question_answer_keys', function (Blueprint $table) {
            $table->foreignUuid('question_id')->primary()->constrained('quiz_questions')->cascadeOnDelete();
            $table->json('answer_key');
        });

        Schema::create('content_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lesson_id')->nullable()->constrained('lessons')->cascadeOnDelete();
            $table->foreignUuid('quiz_id')->nullable()->constrained('unit_quizzes')->cascadeOnDelete();
            $table->integer('content_version');
            $table->enum('status', ['pending', 'approved', 'changes_requested'])->default('pending');
            $table->foreignUuid('submitted_by')->constrained('profiles')->cascadeOnDelete();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('profiles')->nullOnDelete();
            $table->text('review_note')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamp('reviewed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reviews');
        Schema::dropIfExists('quiz_question_answer_keys');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('unit_quizzes');
        Schema::dropIfExists('lesson_question_answer_keys');
        Schema::dropIfExists('lesson_questions');
    }
};
