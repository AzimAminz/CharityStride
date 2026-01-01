<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Handle file upload for NGO registration
     * Supports logo and document uploads
     */
    public function upload(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'file' => 'required|file',
                'type' => 'required|in:logo,doc,poster'
            ]);

            $file = $request->file('file');
            $type = $request->input('type');

            // Define validation rules based on type
            if ($type === 'logo') {
                $request->validate([
                    'file' => 'mimes:png,jpg,jpeg,svg|max:2048' // 2MB max for logos
                ]);
                $folder = 'logos';
            } elseif ($type === 'poster') {
                $request->validate([
                    'file' => 'mimes:png,jpg,jpeg,svg,webp|max:5120' // 5MB max for posters
                ]);
                $folder = 'posters';
            } else {
                $request->validate([
                    'file' => 'mimes:pdf,doc,docx,png,jpg,jpeg|max:5120' // 5MB max for documents
                ]);
                $folder = 'documents';
            }

            // Generate unique filename using original name
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            // Sanitize filename - remove special characters and spaces
            $sanitizedName = preg_replace('/[^A-Za-z0-9\-_]/', '_', $originalName);
            $extension = $file->getClientOriginalExtension();
            $filename = $sanitizedName . '_' . time() . '.' . $extension;

            // Delete old file if provided (for replacement)
            $oldPath = $request->input('old_path');
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Store file in public disk
            $path = $file->storeAs($folder, $filename, 'public');

            // Generate URL for the stored file
            // Check if URL already absolute (starts with http/https)
            $url = Storage::disk('public')->url($path);
            if (!Str::startsWith($url, ['http://', 'https://'])) {
                // If relative, prepend APP_URL
                $url = config('app.url') . $url;
            }

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
                'filename' => $file->getClientOriginalName()
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid file. Please check file type and size.',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'File upload failed. Please try again.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete uploaded file
     */
    public function delete(Request $request)
    {
        try {
            $request->validate([
                'path' => 'required|string'
            ]);

            $path = $request->input('path');

            // Check if file exists and delete it
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'error' => 'File not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'File deletion failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
