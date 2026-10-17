<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Spatie\TranslationLoader\LanguageLine;

class TranslationController extends Controller{
  /**
   * Get common translations (group='common') in nested format.
   *
   * @param string $lang
   * @return \Illuminate\Http\JsonResponse
   */
  public function getCommon(string $lang){
    $lines = LanguageLine::where('group','common')->get();
    $result = [];
    foreach($lines as $line){
      // getTranslation() is available on Spatie's model
      $translation = $line->getTranslation($lang);
      if($translation) $this->setNestedValue($result, $line->key, $translation);
    }
    return jsonSuccess($result);
  }

  /**
   * Set a value in a nested array using dot notation.
   *
   * @param array $array
   * @param string $key
   * @param mixed $value
   * @return void
   */
  private function setNestedValue(array &$arr, string $key, $value): void{
    $keys = explode('.', $key);
    $current = &$arr;

    foreach($keys as $i => $segment){
      if($i === count($keys) - 1){
        $current[$segment] = $value;
      }else{
        if(!isset($current[$segment]) || !is_array($current[$segment])){
          $current[$segment] = [];
        }
        $current = &$current[$segment];
      }
    }
  }
}