<?php

use App\Enums\QuestionType;
use App\Models\LessonQuestion;
use App\Models\LessonQuestionAnswerKey;
use App\Services\ScoringService;

test('scoring service grades multiple choice and fill blank questions', function () {
    $service = new ScoringService();

    $mc = new LessonQuestion(['question_type' => QuestionType::McPasanToId, 'points' => 10]);
    $mc->setRelation('answerKey', new LessonQuestionAnswerKey(['answer_key' => ['correct_option' => 'B']]));

    expect($service->gradeQuestion($mc, ['selected_option' => 'B']))->toBe(['is_correct' => true, 'earned_points' => 10.0]);
    expect($service->gradeQuestion($mc, ['selected_option' => 'A']))->toBe(['is_correct' => false, 'earned_points' => 0.0]);

    $fill = new LessonQuestion(['question_type' => QuestionType::FillBlank, 'points' => 15]);
    $fill->setRelation('answerKey', new LessonQuestionAnswerKey(['answer_key' => ['correct_choice' => 'C']]));

    expect($service->gradeQuestion($fill, ['selected_choice' => 'C']))->toBe(['is_correct' => true, 'earned_points' => 15.0]);
    expect($service->gradeQuestion($fill, ['selected_choice' => 'A']))->toBe(['is_correct' => false, 'earned_points' => 0.0]);
});

test('scoring service grades matching questions with partial credit', function () {
    $service = new ScoringService();

    $matching = new LessonQuestion(['question_type' => QuestionType::Matching, 'points' => 9]);
    $matching->setRelation('answerKey', new LessonQuestionAnswerKey([
        'answer_key' => ['pairs' => ['L1' => 'R2', 'L2' => 'R1', 'L3' => 'R3']],
    ]));

    $partial = $service->gradeQuestion($matching, ['pairs' => ['L1' => 'R2', 'L2' => 'R1', 'L3' => 'R1']]);
    expect($partial)->toBe(['is_correct' => false, 'earned_points' => 6.0]);

    $full = $service->gradeQuestion($matching, ['pairs' => ['L1' => 'R2', 'L2' => 'R1', 'L3' => 'R3']]);
    expect($full)->toBe(['is_correct' => true, 'earned_points' => 9.0]);
});

test('scoring service safely handles zero max points', function () {
    $service = new ScoringService();

    expect($service->calculatePercentage(0, 0))->toBe(0.0);
    expect($service->calculatePercentage(75, 100))->toBe(75.0);
});
