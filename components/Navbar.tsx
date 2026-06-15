"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBag,
  User,
  LogOut,
  Package,
  ChevronDown,
  X,
  Loader2,
  MailCheck,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import CartDrawer from "./CartDrawer";

// ─── Centered Popup Window Trigger ──────────────────────────────────────────
const openTicketingPopup = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
  e.preventDefault();
  
  const width = 500;
  const height = 700;
  
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  window.open(
    "https://tix.africa/discover/bththe4th",
    "TixTicketingPopup",
    `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=${width},height=${height},top=${top},left=${left}`
  );
};

// ─── Auth Modal Component ───────────────────────────────────────────────────
function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result =
      mode === "login"
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form.fullName);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === "register") {
      setRegisteredEmail(form.email);
      setIsRegistered(true);
    } else {
      onClose();
    }
  };

  if (isRegistered) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-surface rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center border border-border">
          <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors">
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-surface-muted border border-border rounded-full flex items-center justify-center mx-auto mb-6 text-foreground">
            <MailCheck size={26} />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-2">Confirm Email</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mb-6">Verification Link Sent</p>
          <p className="text-muted font-bold text-xs uppercase tracking-wide leading-relaxed mb-8">
            We sent a verification link to <span className="text-foreground select-all">{registeredEmail}</span>.
          </p>
          <button
            onClick={() => {
              setIsRegistered(false);
              setMode("login");
              setForm({ email: registeredEmail, password: "", fullName: "" });
            }}
            className="w-full bg-foreground text-background py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 hover:opacity-90 active:scale-95"
          >
            Go To Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-border text-foreground">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-black uppercase italic tracking-tight mb-1">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-xs text-muted font-bold uppercase tracking-widest mb-8">
          {mode === "login" ? "Sign in to your account" : "Join the community"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full p-4 bg-surface-muted rounded-2xl outline-none text-sm font-bold placeholder:text-subtle text-foreground border border-transparent focus:border-border"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-4 bg-surface-muted rounded-2xl outline-none text-sm font-bold placeholder:text-subtle text-foreground border border-transparent focus:border-border"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-4 bg-surface-muted rounded-2xl outline-none text-sm font-bold placeholder:text-subtle text-foreground border border-transparent focus:border-border"
            required
            minLength={6}
          />
          {error && <p className="text-critical text-xs font-bold uppercase tracking-wide">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-foreground text-background py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="text-center text-xs text-muted mt-6">
          {mode === "login" ? "New here?" : "Already have an account?"}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="font-black text-foreground underline ml-1">
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>
        <p className="text-center text-xs mt-4">
          <button onClick={onClose} className="font-bold text-subtle hover:text-muted underline transition-colors">
            Continue as guest
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cart = useCart((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const handleUserClick = () => {
    if (!mounted || authLoading) return;
    if (user) {
      setShowDropdown((v) => !v);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
    router.push("/");
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border shadow-sm text-foreground">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="BTH+ Logo" width={140} height={140} priority className="h-26 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="/products" className="hover:text-claret transition-colors">Shop</Link>
            
            {/* Ticketing Modal Trigger */}
            <a 
              href="https://tix.africa/discover/bththe4th"
              onClick={openTicketingPopup}
              className="hover:text-claret font-bold uppercase text-sm tracking-widest transition-colors cursor-pointer"
            >
              Tickets
            </a>

            <Link href="/gallery" className="hover:text-claret transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-claret transition-colors">About</Link>
            
            {/* Added Contact Route Link */}
            <Link href="/contacts" className="hover:text-claret transition-colors">Contact</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button onClick={handleUserClick} className="flex items-center gap-2 hover:text-claret transition-colors">
                <User size={20} />
                {mounted && user && (
                  <>
                    <span className="hidden sm:block text-xs font-black">{firstName}</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>
              {showDropdown && user && (
                <div className="absolute right-0 mt-3 w-52 bg-surface shadow-xl rounded-2xl border border-border z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs truncate font-black">{user.email}</p>
                  </div>
                  <Link href="/account" className="flex gap-2 p-3 text-xs font-black uppercase tracking-wider hover:bg-surface-muted transition-colors">
                    <Package size={16} /> Orders
                  </Link>
                  <button onClick={handleSignOut} className="flex gap-2 p-3 text-xs font-black uppercase tracking-wider w-full text-left hover:bg-surface-muted text-claret transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)} className="relative hover:text-claret transition-colors">
              <ShoppingBag size={20} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-background">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button className="md:hidden flex flex-col gap-[6px] p-1" onClick={() => setMobileMenuOpen((v) => !v)}>
              <span className={`block w-6 h-[2px] bg-black transition-all duration-300 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`} />
              <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-[2px] bg-black transition-all duration-300 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border px-6 py-6 flex flex-col gap-5">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-black hover:text-claret transition-colors">
              Shop
            </Link>
            
            <button
              onClick={(e) => {
                setMobileMenuOpen(false);
                openTicketingPopup(e);
              }}
              className="text-left text-sm font-black uppercase tracking-widest text-black hover:text-claret transition-colors w-full"
            >
              Tickets
            </button>

            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-black hover:text-claret transition-colors">
              Gallery
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-black hover:text-claret transition-colors">
              About
            </Link>
            
            {/* Added Contact Route Mobile Link */}
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-black hover:text-claret transition-colors">
              Contact
            </Link>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}