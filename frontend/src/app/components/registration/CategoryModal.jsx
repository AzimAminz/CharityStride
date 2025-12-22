"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check } from "lucide-react";

export default function CategoryModal({
  category,
  onClose,
  onAddToCart,
  userAge = 25,
}) {
  const [selectedTier, setSelectedTier] = useState(() => {
    if (!category.fee_tiers || category.fee_tiers.length === 0) return null;

    // Auto-select based on age
    const matchingTier = category.fee_tiers.find((tier) => {
      const minAge = tier.min_age || 0;
      const maxAge = tier.max_age || 999;
      return userAge >= minAge && userAge <= maxAge;
    });

    return matchingTier || category.fee_tiers[0];
  });

  const [tshirtSize, setTshirtSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const currentTier = selectedTier || { fee_amount: category.base_fee || 0 };
  const unitPrice = currentTier.fee_amount;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      categoryId: category.id,
      categoryName: category.category_name,
      feeTierId: currentTier.id,
      tierName: currentTier.tier_name || "Standard",
      unitPrice,
      quantity,
      totalPrice,
      tshirtSize:
        category.has_event_tshirt || category.has_finisher_tshirt
          ? tshirtSize
          : null,
      hasEventTshirt: category.has_event_tshirt,
      hasFinisherTshirt: category.has_finisher_tshirt,
    };

    onAddToCart(cartItem);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-purple-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {category.category_name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure your registration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Fee Tier Selection */}
          {category.fee_tiers && category.fee_tiers.length > 0 && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Rate Category
              </h4>
              <div className="space-y-2">
                {category.fee_tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedTier?.id === tier.id
                        ? "border-purple-500 bg-purple-50 text-purple-900 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {tier.tier_name}
                          </span>
                          {tier.min_age && tier.max_age && (
                            <span className="text-xs text-gray-500">
                              (Age {tier.min_age}-{tier.max_age})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">
                          RM {(tier.fee_amount / 100).toFixed(2)}
                        </span>
                        {selectedTier?.id === tier.id && (
                          <Check className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* T-Shirt Size */}
          {(category.has_event_tshirt || category.has_finisher_tshirt) && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                T-Shirt Size
              </h4>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setTshirtSize(size)}
                    className={`h-12 w-12 rounded-lg font-bold text-sm transition-all ${
                      tshirtSize === size
                        ? "bg-black text-white scale-110 shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Quantity */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Quantity
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4 text-gray-700" />
                </button>
                <span className="w-12 text-center font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-3 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-3xl font-bold text-purple-600">
                  RM {(totalPrice / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </motion.div>
    </div>
  );
}
