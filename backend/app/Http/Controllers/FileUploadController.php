<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Handle file upload for NGO registration
     * Supports logo and document uploads
     */
    public function upload(Request $request)
    {
        Log::info('Upload request received', [
            'content_length' => $request->header('Content-Length'),
            'has_file' => $request->hasFile('file'),
            'type' => $request->input('type'),
            'files' => array_keys($request->allFiles())
        ]);

        try {
            // Check if type is present first
            if (!$request->has('type')) {
                return response()->json([
                    'success' => false,
                    'error' => 'The file type (logo/doc/poster) is missing from the request.'
                ], 422);
            }

            // Define validation rules based on type
            $type = $request->input('type');
            $rules = ['type' => 'required|in:logo,doc,poster'];

            if ($type === 'logo') {
                $rules['file'] = 'required|file|mimes:png,jpg,jpeg,svg,webp|max:15360'; // 15MB max for logos
                $folder = 'logos';
            } elseif ($type === 'poster') {
                $rules['file'] = 'required|file|mimes:png,jpg,jpeg,svg,webp|max:20480'; // 20MB max for posters
                $folder = 'posters';
            } else {
                $rules['file'] = 'required|file|mimes:pdf,doc,docx,png,jpg,jpeg,webp|max:15360'; 
                $folder = 'documents';
            }

            $request->validate($rules);
            $file = $request->file('file');

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
            Log::warning('File upload validation failed:', [
                'type' => $request->input('type'),
                'errors' => $e->errors()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Invalid file. Please check file type and size.',
                'errors' => $e->errors()
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
