<?php

namespace App\Services;

use App\Enums\QuestionType;
use App\Models\LessonQuestion;
use App\Models\QuizQuestion;

class ScoringService
{
    public function gradeQuestion(LessonQuestion|QuizQuestion $question, array $responseData): array
    {
        if (! $question->relationLoaded('answerKey')) {
            $question->load('answerKey');
        }
        $answerKey = $question->answerKey?->answer_key ?? [];
        $maxPoints = (float) $question->points;

        return match ($question->question_type) {
            QuestionType::McPasanToId, QuestionType::McIdToPasan => $this->gradeSingleChoice(
                $responseData['selected_option'] ?? null,
                $answerKey['correct_option'] ?? null,
                $maxPoints
            ),
            QuestionType::FillBlank => $this->gradeSingleChoice(
                $responseData['selected_choice'] ?? null,
                $answerKey['correct_choice'] ?? null,
                $maxPoints
            ),
            QuestionType::Matching => $this->gradeMatching(
                $responseData['pairs'] ?? [],
                $answerKey['pairs'] ?? [],
                $maxPoints
            ),
        };
    }

    public function calculatePercentage(float $earnedPoints, float $maxPoints): float
    {
        if ($maxPoints <= 0) {
            return 0.0;
        }

        return round(($earnedPoints / $maxPoints) * 100, 2);
    }

    private function gradeSingleChoice(mixed $selected, mixed $correct, float $maxPoints): array
    {
        $isCorrect = $selected !== null && $correct !== null && (string) $selected === (string) $correct;

        return [
            'is_correct' => $isCorrect,
            'earned_points' => $isCorrect ? $maxPoints : 0.0,
        ];
    }

    private function gradeMatching(mixed $givenPairs, mixed $expectedPairs, float $maxPoints): array
    {
        if (! is_array($givenPairs) || ! is_array($expectedPairs) || count($expectedPairs) === 0) {
            return [
                'is_correct' => false,
                'earned_points' => 0.0,
            ];
        }

        $totalPairs = count($expectedPairs);
        $correctPairs = 0;

        foreach ($expectedPairs as $leftId => $rightId) {
            if (isset($givenPairs[$leftId]) && (string) $givenPairs[$leftId] === (string) $rightId) {
                $correctPairs++;
            }
        }

        $earnedPoints = round(($correctPairs / $totalPairs) * $maxPoints, 2);

        return [
            'is_correct' => $correctPairs === $totalPairs,
            'earned_points' => $earnedPoints,
        ];
    }
}
