<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('halal_restaurants', function (Blueprint $table) {
            $table->string('place_id')->nullable()->unique()->after('id');
            $table->decimal('rating', 2, 1)->nullable()->after('phone_number');
            $table->unsignedInteger('rating_count')->nullable()->after('rating');
            $table->string('cuisine_type')->nullable()->after('rating_count');
            $table->text('photo_url')->nullable()->after('cuisine_type');
            $table->decimal('latitude', 10, 7)->nullable()->after('photo_url');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->text('google_maps_url')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('halal_restaurants', function (Blueprint $table) {
            $table->dropUnique(['place_id']);
            $table->dropColumn([
                'place_id',
                'rating',
                'rating_count',
                'cuisine_type',
                'photo_url',
                'latitude',
                'longitude',
                'google_maps_url',
            ]);
        });
    }
};
