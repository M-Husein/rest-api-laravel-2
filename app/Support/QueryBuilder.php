<?php
namespace App\Support;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\{Paginator,LengthAwarePaginator};
use Illuminate\Pagination\CursorPaginator;

class QueryBuilder{
  /**
   * Underlying Eloquent query builder.
   */
  protected Builder $query;

  /**
   * Columns allowed for global search.
   * Example:
   * ?q=admin
   */
  protected array $search = [];

  /**
   * Columns allowed for filtering.
   * Example:
   * ?filter[name]=admin
   */
  protected array $filter = [];

  /**
   * Columns allowed for sorting.
   * Example:
   * ?sort=name,-created_at
   */
  protected array $sort = [];

  /**
   * Columns allowed for selection.
   * Example:
   * ?select=id,name,email
   */
  protected array $select = [];

  /**
   * Create a new QueryBuilder instance.
   *
   * @param Builder $query
   */
  public function __construct(Builder $query){
    $this->query = $query;
  }

  /**
   * Create a new QueryBuilder instance.
   *
   * @param Builder $query
   * @return static
   */
  public static function for(Builder $query): self{
    return new self($query);
  }

  /**
   * Define searchable columns.
   * Example:
   * ->search([
   *   'name',
   *   'email',
   * ])
   *
   * @param array $columns
   * @return $this
   */
  public function search(array $columns): self{
    $this->search = $columns;
    $this->applySearch();
    return $this;
  }

  /**
   * Define filterable columns.
   * Example:
   * ->filter([
   *   'name',
   *   'email',
   * ])
   *
   * @param array $columns
   * @return $this
   */
  public function filter(array $columns): self{
    $this->filter = $columns;
    $this->applyfilter();
    return $this;
  }

  /**
   * Define sortable columns.
   * Example:
   * ->sort([
   *   'name',
   *   'created_at',
   * ])
   *
   * @param array $columns
   * @return $this
   */
  public function sort(array $columns): self{
    $this->sort = $columns;
    $this->applySort();
    return $this;
  }

  /**
   * Define selectable columns.
   * Example:
   * ->select([
   *   'id',
   *   'name',
   *   'email',
   * ])
   *
   * @param array $columns
   * @return $this
   */
  public function select(array $columns): self{
    $this->select = $columns;
    return $this;
  }

  /**
   * Case-insensitive LIKE operator for the current driver.
   *
   * MySQL's LIKE is case-insensitive by default, while PostgreSQL's is
   * case-sensitive. Use ILIKE on pgsql to keep behavior consistent.
   *
   * @return string
   */
  protected function likeOperator(): string{
    return $this->query->getConnection()->getDriverName() === 'pgsql'
      ? 'ilike'
      : 'like';
  }

  /**
   * Apply global search.
   *
   * Example:
   * ?q=admin
   *
   * @return void
   */
  protected function applySearch(): void{
    $q = trim(request('q', ''));
    if($q === '' || empty($this->search)){
      return;
    }

    $this->query->where(
      function($query) use ($q){
        foreach($this->search as $column){
          $query->orWhere($column, $this->likeOperator(), "%{$q}%");
        }
      }
    );
  }

  /**
   * Apply filter.
   * Example:
   * ?filter[name]=admin
   *
   * @return void
   */
  protected function applyfilter(): void{
    $filter = request('filter', []);
    foreach($filter as $column => $value){
      if(!in_array($column, $this->filter) || blank($value)){
        continue;
      }
      $this->query->where($column, $this->likeOperator(), "%{$value}%");
    }
  }

  /**
   * Apply sorting.
   * Example:
   * ?sort=name,-created_at
   *
   * @return void
   */
  protected function applySort(): void{
    $sort = request('sort');
    if(blank($sort)) return;

    foreach(explode(',', $sort) as $column){
      $dir = str_starts_with($column, '-') ? 'desc' : 'asc';
      $column = ltrim($column, '-');

      if(!in_array($column, $this->sort)){
        continue;
      }
      $this->query->orderBy($column, $dir);
    }
  }

  /**
   * Get selected columns from request.
   * Example:
   * ?select=id,name,email
   *
   * @return array
   */
  protected function getSelectedColumns(): array{
    $select = request('select');
    if(!$select || empty($this->select)){
      return ['*'];
    }

    $columns = collect(explode(',', $select))
      ->map(fn($column) => trim($column))
      ->filter()
      ->unique()
      ->values()
      ->all();

    $columns = array_values(array_intersect($columns, $this->select));

    if(empty($columns)) return ['*'];

    if(!in_array('id', $columns)){
      $columns[] = 'id';
    }
    return array_unique($columns);
  }

  /**
   * Get validated per-page value.
   * Example:
   * ?perPage=25
   *
   * @return int
   */
  protected function getPerPage(): int{
    return max(
      1,
      min((int) request('perPage', 10), 100)
    );
  }

  /**
   * Get underlying Eloquent builder.
   *
   * @return Builder
   */
  public function builder(): Builder{
    return $this->query;
  }

  /**
   * Execute query and return all matching rows.
   *
   * @return Collection
   */
  public function get(): Collection{
    return $this->query->get($this->getSelectedColumns());
  }

  /**
   * Execute query and return first row.
   *
   * @return mixed
   */
  public function first(): mixed{
    return $this->query->first($this->getSelectedColumns());
  }

  /**
   * Execute query and return total count.
   *
   * @return int
   */
  public function count(): int{
    return $this->query->count();
  }

  /**
   * Execute query using length-aware pagination.
   * Returns total rows and last page.
   *
   * @param int|null $perPage
   * @return LengthAwarePaginator
   */
  public function paginate(?int $perPage = null): LengthAwarePaginator{
    return $this->query->paginate(
      $perPage ?? $this->getPerPage(),
      $this->getSelectedColumns()
    );
  }

  /**
   * Execute query using simple pagination.
   * Faster than paginate() because it skips COUNT(*).
   *
   * @param int|null $perPage
   * @return Paginator
   */
  public function simplePaginate(?int $perPage = null): Paginator{
    return $this->query->simplePaginate(
      $perPage ?? $this->getPerPage(),
      $this->getSelectedColumns()
    );
  }

  /**
   * Execute query using cursor pagination.
   * Recommended for infinite scrolling.
   *
   * @param int|null $perPage
   * @return CursorPaginator
   */
  public function cursorPaginate(?int $perPage = null): CursorPaginator{
    return $this->query->cursorPaginate(
      $perPage ?? $this->getPerPage(),
      $this->getSelectedColumns()
    );
  }
}