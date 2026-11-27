<?php

namespace App\Enums;

enum QuestionType: string
{
    case McPasanToId = 'mc_pasan_to_id';
    case McIdToPasan = 'mc_id_to_pasan';
    case Matching = 'matching';
    case FillBlank = 'fill_blank';
}
