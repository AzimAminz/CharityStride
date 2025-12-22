"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trophy, Trash2 } from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemove,
  onCheckout,
}) {
  const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const itemCount = items.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[80] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                  <p className="text-sm text-gray-500">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add categories to get started
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.cartId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="relative group p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Trophy className="h-7 w-7 text-purple-600" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 truncate">
                          {item.categoryName}
                        </h4>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2 text-xs mb-2">
                          <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200 font-medium">
                            {item.tierName}
                          </span>
                          {item.tshirtSize && (
                            <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200 font-medium">
                              Size {item.tshirtSize}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-white rounded-md border border-gray-200 font-medium">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Price */}
                        <p className="text-purple-600 font-bold">
                          RM {(item.totalPrice / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemove(item.cartId)}
                        className="absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white space-y-4">
                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Total to Pay
                  </span>
                  <span className="text-4xl font-bold text-gray-900">
                    RM {(total / 100).toFixed(2)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={onCheckout}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all active:scale-95"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
