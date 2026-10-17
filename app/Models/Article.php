<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model{
  use HasFactory,SoftDeletes;

  protected $fillable = [
    'title',
    'slug',
    'desc',
    'content',
    'is_active',
    'published_at',
    'view_count'
  ];

  protected $casts = [
    'is_active'   => 'boolean',
    'published_at'=> 'datetime',
    'view_count'  => 'integer'
  ];

  // Auto-generate slug from title
  protected static function booted(){
    static::creating(function($article){
      if(empty($article->slug)){
        $article->slug = Str::slug($article->title);
      }
    });
  }
}