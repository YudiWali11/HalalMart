<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     * Only returns transactions belonging to the authenticated user.
     */
    public function index(Request $request)
    {
        return response()->json(
            Transaction::where('user_id', $request->user()->id)->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id'          => 'required|string',
            'name'        => 'required|string',
            'date'        => 'required|date',
            'category_id' => 'required|string',
            'amount'      => 'required|numeric',
            'notes'       => 'nullable|string',
            'type'        => 'required|in:masuk,keluar',
            'receipt'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120', // max 5MB
        ]);

        // Upload receipt ke Supabase Storage jika ada file yang dikirim
        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 's3');
            // Format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
            $projectId = 'muypcrxbrgwkmsczhqnd';
            $bucket = env('AWS_BUCKET', 'receipts');
            $validated['receipt_url'] = "https://{$projectId}.supabase.co/storage/v1/object/public/{$bucket}/{$path}";
        }

        // Hapus key 'receipt' dari array agar tidak masuk ke database
        unset($validated['receipt']);

        $validated['user_id'] = $request->user()->id;

        $transaction = Transaction::create($validated);
        return response()->json($transaction, 201);
    }

    public function show(Request $request, string $id)
    {
        return Transaction::where('user_id', $request->user()->id)->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string',
            'date'        => 'sometimes|date',
            'category_id' => 'sometimes|string',
            'amount'      => 'sometimes|numeric',
            'notes'       => 'nullable|string',
            'type'        => 'sometimes|in:masuk,keluar',
            'receipt'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Jika ada file baru, hapus file lama dan upload yang baru
        if ($request->hasFile('receipt')) {
            // Hapus file lama dari Supabase Storage jika ada
            if ($transaction->receipt_url) {
                $oldPath = parse_url($transaction->receipt_url, PHP_URL_PATH);
                $oldPath = ltrim(str_replace('/storage/v1/s3/' . env('AWS_BUCKET') . '/', '', $oldPath), '/');
                Storage::disk('s3')->delete($oldPath);
            }

            $path = $request->file('receipt')->store('receipts', 's3');
            $projectId = 'muypcrxbrgwkmsczhqnd';
            $bucket = env('AWS_BUCKET', 'receipts');
            $validated['receipt_url'] = "https://{$projectId}.supabase.co/storage/v1/object/public/{$bucket}/{$path}";
        }

        unset($validated['receipt']);

        $transaction->update($validated);
        return response()->json($transaction);
    }

    public function destroy(Request $request, string $id)
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->findOrFail($id);

        // Hapus file dari Supabase Storage jika ada
        if ($transaction->receipt_url) {
            $oldPath = parse_url($transaction->receipt_url, PHP_URL_PATH);
            $oldPath = ltrim(str_replace('/storage/v1/s3/' . env('AWS_BUCKET') . '/', '', $oldPath), '/');
            Storage::disk('s3')->delete($oldPath);
        }

        $transaction->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
