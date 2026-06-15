"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Prevent background body scrolling when the ticket system is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative bg-white w-full max-w-4xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted">
          <span className="text-xs font-black uppercase tracking-widest text-muted">
            BTH Tickets Checkout
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 bg-foreground text-background text-xs font-black uppercase tracking-wider rounded-xl transition-transform active:scale-95 hover:opacity-90 cursor-pointer"
          >
            <X size={14} /> Close
          </button>
        </div>

        {/* Embedded Portal view area */}
        <div className="flex-1 w-full h-full relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
              <Loader2 size={32} className="animate-spin text-claret" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Connecting to Secure Checkout...
              </p>
            </div>
          )}
          
          <iframe
            src="https://tix.africa/discover/bththe4th"
            title="BTH Tickets Purchase"
            className="w-full h-full border-none"
            allow="payment"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}