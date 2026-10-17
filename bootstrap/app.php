<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\{Exceptions,Middleware};
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Spatie\Permission\Middleware\{RoleMiddleware,PermissionMiddleware,RoleOrPermissionMiddleware};
use NielsNumbers\LaravelLocalizer\Middleware\{SetLocale,RedirectLocale};
use App\Http\Middleware\{SecurityHeaders,SecureApiHeaders,SetLang};

return Application::configure(basePath:dirname(__DIR__))
  ->withRouting(
    web:__DIR__.'/../routes/web.php',
    api:__DIR__.'/../routes/api.php',
    commands:__DIR__.'/../routes/console.php',
    health:'/up'
  )
  ->withMiddleware(function(Middleware $middleware){
    $middleware->statefulApi();// Enable stateful API for Sanctum SPA cookie auth
    $middleware->preventRequestForgery(except: ['api/*']);// Exclude API routes from CSRF verification
    $middleware->redirectUsersTo('/');// Redirect authenticated users away from guest routes
    $middleware->redirectGuestsTo('/login');// Redirect unauthenticated users away from auth routes
    $middleware->web(remove: [SubstituteBindings::class]);
    $middleware->web(append: [
      SecurityHeaders::class,
      SetLocale::class,
      RedirectLocale::class,
      SubstituteBindings::class,
      \RzlZone\BladeMinify\Middleware\RzlBladeOutputMinifier::class
    ]);
    $middleware->api(append: [SecureApiHeaders::class,SetLang::class]);
    $middleware->alias([
      'role' => RoleMiddleware::class,
      'permission' => PermissionMiddleware::class,
      'role_or_permission' => RoleOrPermissionMiddleware::class
    ]);
  })
  ->withExceptions(function(Exceptions $exceptions){
    // API routes always return JSON errors, never redirects
    $exceptions->shouldRenderJsonWhen(
      fn(Request $request) => $request->is('api/*') || $request->expectsJson()
    );

    // Custom API exception handler
    $exceptions->render(function(Throwable $e, Request $request){
      if($request->expectsJson() || $request->is('api/*')){
        $statusCode = 500;
        $msgKey = 'error.unspecific';
        $errors = null;

        if($e instanceof ValidationException){
          $statusCode = 422;
          $msgKey = 'validation.failed';
          $errors = $e->errors();
        }
        elseif($e instanceof NotFoundHttpException){
          $statusCode = 404;
          $msgKey = 'error.404';
        }
        elseif($e instanceof AuthenticationException){
          $statusCode = 401;
          $msgKey = 'auth.failed';
        }
        elseif($e instanceof AuthorizationException){
          $statusCode = 403;
          $msgKey = 'error.403';
        }
        elseif($e instanceof ThrottleRequestsException){
          $statusCode = 429;// Rate Limit
          $msgKey = "error.429";
        }
        elseif($e instanceof HttpException){
          $statusCode = $e->getStatusCode();
          $msgKey = "error.{$statusCode}";
        }

        $message = __($msgKey);
        if($message === $msgKey){
          $defaultMessages = [
            401 => 'Unauthenticated',
            403 => 'Forbidden',
            404 => 'Not Found',
            422 => 'Validation failed',
            429 => 'Too many requests',
            500 => 'Server error occurred'
          ];
          $message = $defaultMessages[$statusCode] ?? 'An error occurred';
        }
        if(config('app.debug') && $statusCode >= 500){
          $errors = [
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTrace()
          ];
        }
        return jsonError($message, $statusCode, $errors);
      }
      return null;
    });
  })
  ->create();