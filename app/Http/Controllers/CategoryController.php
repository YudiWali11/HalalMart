<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     * Only returns categories belonging to the authenticated user.
     */
    public function index(Request $request)
    {
        return response()->json(
            Category::where('user_id', $request->user()->id)->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'type' => 'required|in:masuk,keluar',
        ]);

        $validated['user_id'] = $request->user()->id;

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function show(Request $request, string $id)
    {
        return Category::where('user_id', $request->user()->id)->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $category = Category::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|in:masuk,keluar',
        ]);
        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(Request $request, string $id)
    {
        $category = Category::where('user_id', $request->user()->id)->findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
