<?php
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\{Paginator,LengthAwarePaginator};
if(!function_exists('jsonSuccess')){
  /**
   * Return success JSON response
   * 
   * @param mixed $data         Response data (null when no data)
   * @param string $message      Success message (empty when no message)
   * @param int $code            HTTP status code
   * @param array|null $headers  Additional headers
   * @param bool|null $unescaped Unescape Unicode and slashes (default true for APIs)
   * @return \Illuminate\Http\JsonResponse
   */
  function jsonSuccess(
    mixed $data = null,
    string $message = '',
    int $code = 200,
    ?array $headers = [],
    ?bool $unescaped = true
  ):JsonResponse{
    return response()->json(
      [
        'success' => true,
        'message' => $message,
        'data' => $data
      ],
      $code,
      $headers,
      $unescaped ? JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES : 0
    );
  }
}

if(!function_exists('jsonError')){
  /**
   * Return error JSON response
   * 
   * @param string $message     Error message (required)
   * @param int $code           HTTP status code (default 400)
   * @param mixed $errors       Detailed validation errors (optional)
   * @param array|null $headers Additional headers (optional)
   * @param bool|null $unescaped Unescape Unicode and slashes (default true)
   * @return \Illuminate\Http\JsonResponse
   */
  function jsonError(
    string $message = '',
    int $code = 400,
    mixed $errors = null,
    ?array $headers = [],
    ?bool $unescaped = true
  ):JsonResponse{
    $response = [
      'success' => false,
      'message' => $message
    ];
    if($errors !== null){
      $response['errors'] = $errors;
    }
    return response()->json(
      $response,
      $code,
      $headers,
      $unescaped ? JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES : 0
    );
  }
}

if(!function_exists('jsonPaginated')){
  /**
   * Return paginated JSON response
   * 
   * @param \Illuminate\Pagination\LengthAwarePaginator $paginator
   * @param string $resourceClass API Resource class name
   * @param string $message Response message (optional)
   * @param int $code HTTP status code
   * @param array|null $headers Additional headers
   * @param bool|null $unescaped Unescape Unicode and slashes
   * @return \Illuminate\Http\JsonResponse
   */
  function jsonPaginated(
    $paginator,
    // string $resourceClass,
    string $message = '',
    int $code = 200,
    ?array $headers = [],
    ?bool $unescaped = true
  ):JsonResponse{
    // // Option: Support both Resource and Non-Resource
    // $data = $resourceClass 
    //   ? $resourceClass::collection($paginator->getCollection())
    //   : $paginator->items();
    return response()->json(
      [
        'success' => true,
        'message' => $message,
        'data' => $paginator->items(),
        'meta' => [
          'page' => $paginator->currentPage(),
          'perPage' => $paginator->perPage(),
          'total' => $paginator->total(),
          'lastPage' => $paginator->lastPage()
        ]
      ],
      $code,
      $headers,
      $unescaped ? JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES : 0
    );
  }
}

if(!function_exists('jsonLazy')){
  /**
   * Return lazy loading response.
   *
   * @param mixed $items
   * @param string $message
   * @param int $code
   * @param array|null $headers
   * @param bool|null $unescaped
   * @return JsonResponse
   */
  function jsonLazy(
    $items,
    string $message = '',
    int $code = 200,
    ?array $headers = [],
    ?bool $unescaped = true
  ):JsonResponse{
    $meta = [];

    if($items instanceof Paginator){ // || $items instanceof CursorPaginator
      $data = $items->items();
      $meta['more'] = $items->hasMorePages();

      if($items instanceof LengthAwarePaginator){
        $meta['total'] = $items->total();
      }
    }
    elseif($items instanceof CursorPaginator){
      $data = $items->items();
      $meta = [
        'nextCursor' => $items->nextCursor()?->encode(),
        'previousCursor' => $items->previousCursor()?->encode()
      ];
    }
    elseif($items instanceof Collection){
      $data = $items->values();
    }else{
      $data = $items;
    }

    return response()->json(
      [
        'success' => true,
        'message' => $message,
        'data' => $data,
        'meta' => $meta
      ],
      $code,
      $headers,
      $unescaped ? JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES : 0
    );
  }
}