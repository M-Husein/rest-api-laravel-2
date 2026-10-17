<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// use Illuminate\Http\Response;
// use App\Http\Requests\Api\V1\StoreContactRequest;
// use App\Http\Requests\Api\V1\UpdateContactRequest;
// use App\Http\Resources\Api\V1\ContactResource;
use App\Support\QueryBuilder;
use App\Models\Contact;

class ContactController extends Controller{
  public function index(Request $request){
    $same = ['label','value','type','icon','sort'];
    $same2 = [...$same,'created_at'];
    $query = QueryBuilder::for(Contact::query())
      ->search($same)
      ->filter($same2)
      ->sort($same2)
      ->select($same2);

    return match($request->query('mode','table')){
      'all' => jsonSuccess($query->get()),
      'lazy' => jsonLazy($query->simplePaginate()),
      default => jsonPaginated($query->paginate())
    };
  }

  // public function store(StoreContactRequest $request){
  //   $contact = Contact::create($request->validated());

  //   return (new ContactResource($contact))
  //     ->response()
  //     ->setStatusCode(Response::HTTP_CREATED);
  // }

  // public function show(Contact $contact){
  //   return new ContactResource($contact);
  // }

  // public function update(UpdateContactRequest $request, Contact $contact){
  //   $contact->update($request->validated());

  //   return new ContactResource($contact);
  // }

  // public function destroy(Contact $contact){
  //   $contact->delete();
  //   return response()->json(null, Response::HTTP_NO_CONTENT);
  // }
}