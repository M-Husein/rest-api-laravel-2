<?php
namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Traits\HasSupportedProviders;

class LoginController extends Controller{
  use HasSupportedProviders;

  public function __invoke(){
    $providers = $this->getSupportedProviders();
    return view('app', ['providers' => $providers]);
  }
}