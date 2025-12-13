<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\EventSection;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventSectionController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $ngo = $request->user()->ngo;
        
        $event = Event::where('id', $eventId)->where('ngo_id', $ngo->id)->first();
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'string',  // Array of image URLs
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $section =EventSection::create([
            'event_id' => $eventId,
            'title' => $request->title,
            'content' => $request->content,
            'images' => $request->images ?? [],
        ]);

        return response()->json(['message' => 'Section created', 'section' => $section], 201);
    }

    public function update(Request $request, $eventId, $id)
    {
        $ngo = $request->user()->ngo;
        $event = Event::where('id', $eventId)->where('ngo_id', $ngo->id)->first();
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $section = EventSection::where('id', $id)->where('event_id', $eventId)->first();
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'content' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $section->update($request->only(['title', 'content', 'images']));

        return response()->json(['message' => 'Section updated', 'section' => $section]);
    }

    public function destroy(Request $request, $eventId, $id)
    {
        $ngo = $request->user()->ngo;
        $event = Event::where('id', $eventId)->where('ngo_id', $ngo->id)->first();
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $section = EventSection::where('id', $id)->where('event_id', $eventId)->first();
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        $section->delete();

        return response()->json(['message' => 'Section deleted']);
    }
}
