<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LessonBuilderController;
use App\Http\Controllers\Admin\QuizController as AdminQuizController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\ValidatorManagementController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Learner\DictionaryController;
use App\Http\Controllers\Learner\LeaderboardController;
use App\Http\Controllers\Learner\LearningPathController;
use App\Http\Controllers\Learner\LessonController;
use App\Http\Controllers\Learner\ProfileController;
use App\Http\Controllers\Learner\QuizController as LearnerQuizController;
use App\Http\Controllers\PreviewController;
use App\Http\Controllers\Validator\ReferenceDictionaryController;
use App\Http\Controllers\Validator\ReviewDetailController;
use App\Http\Controllers\Validator\ReviewHistoryController;
use App\Http\Controllers\Validator\ReviewQueueController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
});

Route::post('/logout', [LogoutController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth', 'role:learner'])->prefix('learner')->name('learner.')->group(function () {
    Route::get('/', [LearningPathController::class, 'index'])->name('home');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/{lesson}/activities/{activity}/complete', [LessonController::class, 'completeActivity'])->name('lessons.activities.complete');
    Route::post('/lessons/{lesson}/responses', [LessonController::class, 'storeResponse'])->name('lessons.responses.store');
    Route::post('/lessons/{lesson}/finish', [LessonController::class, 'finish'])->name('lessons.finish');

    Route::get('/quizzes/{unit}', [LearnerQuizController::class, 'show'])->name('quizzes.show');
    Route::post('/quizzes/{unit}/submit', [LearnerQuizController::class, 'submit'])->name('quizzes.submit');

    Route::get('/kamus', [DictionaryController::class, 'index'])->name('dictionary');
    Route::get('/papan-skor', [LeaderboardController::class, 'index'])->name('leaderboard');
    Route::get('/profil', [ProfileController::class, 'index'])->name('profile');
});

Route::middleware(['auth', 'role:validator'])->prefix('validator')->name('validator.')->group(function () {
    Route::get('/', [ReviewQueueController::class, 'index'])->name('queue');
    Route::get('/reviews/{type}/{id}', [ReviewDetailController::class, 'show'])->name('reviews.show');
    Route::post('/reviews/{review}/approve', [ReviewDetailController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{review}/request-changes', [ReviewDetailController::class, 'requestChanges'])->name('reviews.request-changes');
    Route::get('/riwayat', [ReviewHistoryController::class, 'index'])->name('history');
    Route::get('/kamus', [ReferenceDictionaryController::class, 'index'])->name('dictionary');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/units', [UnitController::class, 'index'])->name('units.index');
    Route::post('/units/{unit}/lessons', [UnitController::class, 'storeLesson'])->name('lessons.store');

    Route::get('/lessons/{lesson}', [LessonBuilderController::class, 'edit'])->name('lessons.edit');
    Route::put('/lessons/{lesson}', [LessonBuilderController::class, 'update'])->name('lessons.update');
    Route::post('/lessons/{lesson}/activities', [LessonBuilderController::class, 'storeActivity'])->name('lessons.activities.store');
    Route::delete('/activities/{activity}', [LessonBuilderController::class, 'destroyActivity'])->name('activities.destroy');
    Route::patch('/lessons/{lesson}/activities/reorder', [LessonBuilderController::class, 'reorderActivities'])->name('lessons.activities.reorder');
    Route::put('/activities/{activity}/material', [LessonBuilderController::class, 'updateMaterial'])->name('activities.material.update');

    Route::post('/activities/{activity}/questions', [LessonBuilderController::class, 'storeQuestion'])->name('activities.questions.store');
    Route::put('/lesson-questions/{question}', [LessonBuilderController::class, 'updateQuestion'])->name('lesson-questions.update');
    Route::delete('/lesson-questions/{question}', [LessonBuilderController::class, 'destroyQuestion'])->name('lesson-questions.destroy');

    Route::post('/lessons/{lesson}/submit-review', [LessonBuilderController::class, 'submitReview'])->name('lessons.submit-review');
    Route::post('/lessons/{lesson}/cancel-review', [LessonBuilderController::class, 'cancelReview'])->name('lessons.cancel-review');
    Route::post('/lessons/{lesson}/publish', [LessonBuilderController::class, 'publish'])->name('lessons.publish');

    Route::get('/quizzes', [AdminQuizController::class, 'index'])->name('quizzes.index');
    Route::post('/quizzes/{quiz}/questions', [AdminQuizController::class, 'storeQuestion'])->name('quizzes.questions.store');
    Route::put('/quiz-questions/{question}', [AdminQuizController::class, 'updateQuestion'])->name('quiz-questions.update');
    Route::delete('/quiz-questions/{question}', [AdminQuizController::class, 'destroyQuestion'])->name('quiz-questions.destroy');
    Route::post('/quizzes/{quiz}/submit-review', [AdminQuizController::class, 'submitReview'])->name('quizzes.submit-review');
    Route::post('/quizzes/{quiz}/cancel-review', [AdminQuizController::class, 'cancelReview'])->name('quizzes.cancel-review');
    Route::post('/quizzes/{quiz}/publish', [AdminQuizController::class, 'publish'])->name('quizzes.publish');

    Route::get('/validators', [ValidatorManagementController::class, 'index'])->name('validators.index');
    Route::post('/validators', [ValidatorManagementController::class, 'store'])->name('validators.store');
    Route::patch('/validators/{profile}/toggle-status', [ValidatorManagementController::class, 'toggleStatus'])->name('validators.toggle');
});

Route::middleware(['auth', 'role:admin,validator'])->prefix('preview')->name('preview.')->group(function () {
    Route::get('/', [PreviewController::class, 'path'])->name('path');
    Route::get('/lessons/{lesson}', [PreviewController::class, 'showLesson'])->name('lessons.show');
    Route::post('/lessons/{lesson}/evaluate', [PreviewController::class, 'evaluateLesson'])->name('lessons.evaluate');
    Route::get('/quizzes/{unit}', [PreviewController::class, 'showQuiz'])->name('quizzes.show');
    Route::post('/quizzes/{unit}/evaluate', [PreviewController::class, 'evaluateQuiz'])->name('quizzes.evaluate');
});
