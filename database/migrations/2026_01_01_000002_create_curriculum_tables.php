<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->integer('order_number')->unique();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->constrained('units')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->text('objective')->nullable();
            $table->integer('order_number');
            $table->integer('content_version')->default(1);
            $table->enum('status', ['draft', 'pending_review', 'changes_requested', 'approved', 'published'])->default('draft');
            $table->timestamps();

            $table->unique(['unit_id', 'order_number']);
        });

        Schema::create('lesson_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->enum('activity_type', ['material', 'exercise']);
            $table->string('title', 200);
            $table->text('instruction')->nullable();
            $table->integer('order_number');
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });

        Schema::create('lesson_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('activity_id')->unique()->constrained('lesson_activities')->cascadeOnDelete();
            $table->text('content');
            $table->text('explanation')->nullable();
            $table->integer('estimated_duration')->nullable();
            $table->timestamps();
        });

        Schema::create('vocabularies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignUuid('first_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('pasan_word', 200);
            $table->string('indonesian_meaning', 255);
            $table->string('category', 100)->nullable();
            $table->text('source_note')->nullable();
            $table->enum('validation_status', ['draft', 'pending_review', 'approved', 'changes_requested'])->default('draft');
            $table->timestamps();
        });

        Schema::create('material_vocabularies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('material_id')->constrained('lesson_materials')->cascadeOnDelete();
            $table->foreignUuid('vocabulary_id')->constrained('vocabularies')->cascadeOnDelete();
            $table->integer('order_number')->default(1);
        });

        Schema::create('material_examples', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('material_id')->constrained('lesson_materials')->cascadeOnDelete();
            $table->text('pasan_text');
            $table->text('indonesian_translation');
            $table->integer('order_number')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_examples');
        Schema::dropIfExists('material_vocabularies');
        Schema::dropIfExists('vocabularies');
        Schema::dropIfExists('lesson_materials');
        Schema::dropIfExists('lesson_activities');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('units');
    }
};
