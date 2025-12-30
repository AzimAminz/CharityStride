"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { CheckCircle, AlertCircle, CreditCard, ArrowLeft } from "lucide-react";
import Layout from "@/app/components/Layout";

export default function MockPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id; // Payment ID (not event ID) on this route

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/${id}`);
        setPayment(res.data);
      } catch (err) {
        console.error("Error fetching payment:", err);
        setError("Failed to load payment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPayment();
    }
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await api.post(`/payments/${id}/mock-process`, {
        payment_method: "mock_gateway",
      });

      setSuccess(true);
      // Wait a moment then redirect
      setTimeout(() => {
        router.push(res.data.redirect_url || "/user/registrations");
      }, 2000);
    } catch (err) {
      console.error("Payment failed:", err);
      // Show full error from backend if available
      setError(
        err.response?.data?.message ||
          "Payment processing failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-green-700 mb-2">
              Processing your registration...
            </p>
            <p className="text-sm text-green-600">
              You will be redirected in a moment.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold tracking-wide">
                Secure Payment
              </span>
            </div>
            <div className="text-xs text-gray-400">Mock Gateway</div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">
                Total Amount
              </p>
              <h1 className="text-4xl font-bold text-gray-900">
                MYR {(payment.amount / 100).toFixed(2)}
              </h1>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Event</span>
                <span className="font-medium text-gray-900 text-right truncate pl-4">
                  {payment.payable?.event?.title || "Event Registration"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono font-medium text-gray-900">
                  {payment.payment_reference}
                </span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Cancel Transaction
            </button>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              This is a secure mock payment gateway for demonstration purposes.
              No actual money will be deducted.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
