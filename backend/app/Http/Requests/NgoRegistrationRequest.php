<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class NgoRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization checked by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Information (Required)
            'name' => 'required|string|max:255',
            'registration_no' => 'required|string|max:100',
            'registration_type' => 'required|string|max:50',
            'category' => 'required|string|max:100',
            'description' => 'required|string|min:50',
            'established_date' => 'nullable|date|before_or_equal:today',
            
            // Address (Required)
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postcode' => 'required|string|max:10',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            
            // Contact Information (Required)
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|regex:/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/',
            
            // Banking Details (Optional)
            'bank_name' => 'nullable|string|max:100',
            'bank_account_no' => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:255',
            
            // Files (Required for doc, optional for logo)
            'logo_url' => 'nullable|string|max:255',
            'registration_doc_url' => 'required|string|max:255',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            // Basic Information
            'name.required' => 'Organization name is required',
            'name.max' => 'Organization name must not exceed 255 characters',
            
            'registration_no.required' => 'Registration number is required',
            'registration_no.max' => 'Registration number must not exceed 100 characters',
            
            'registration_type.required' => 'Registration type is required',
            
            'category.required' => 'Category is required',
            
            'description.required' => 'Description is required',
            'description.min' => 'Description must be at least 50 characters',
            
            'established_date.date' => 'Established date must be a valid date',
            'established_date.before_or_equal' => 'Established date cannot be in the future',
            
            // Address
            'address.required' => 'Address is required',
            
            'city.required' => 'City is required',
            'city.max' => 'City must not exceed 100 characters',
            
            'state.required' => 'State is required',
            
            'postcode.required' => 'Postcode is required',
            'postcode.max' => 'Postcode must not exceed 10 characters',
            
            'latitude.required' => 'Please select location on map',
            'latitude.numeric' => 'Latitude must be a number',
            'latitude.between' => 'Invalid latitude value',
            
            'longitude.required' => 'Please select location on map',
            'longitude.numeric' => 'Longitude must be a number',
            'longitude.between' => 'Invalid longitude value',
            
            // Contact
            'contact_email.required' => 'Contact email is required',
            'contact_email.email' => 'Contact email must be a valid email address',
            
            'contact_phone.required' => 'Contact phone is required',
            'contact_phone.regex' => 'Contact phone must be a valid Malaysian phone number',
            
            // Banking
            'bank_name.max' => 'Bank name must not exceed 100 characters',
            'bank_account_no.max' => 'Bank account number must not exceed 50 characters',
            'bank_account_name.max' => 'Bank account name must not exceed 255 characters',
            
            // Files
            'registration_doc_url.required' => 'Registration document is required',
            'registration_doc_url.max' => 'Registration document URL is too long',
        ];
    }

    /**
     * Force JSON response on validation failure
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422));
    }
}
