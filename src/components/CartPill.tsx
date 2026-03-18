import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const CartPill = () => {
  const { salon, cartCount, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (!salon || cartCount === 0) return null;

  // On the salon's own page, SalonDetail renders its own cart bar
  const isOnCartSalon = location.pathname === `/salon/${salon.id}`;
  // Hide on booking flow too
  const isOnBooking = location.pathname.startsWith('/booking/');

  if (isOnCartSalon || isOnBooking) return null;

  return (
    <div
      className="fixed z-[55] left-1/2 -translate-x-1/2 md:max-w-md animate-[slide-up_0.3s_ease-out]"
      style={{
        bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 12px) + 76px)',
      }}
    >
      <button
        onClick={() => navigate(`/salon/${salon.id}`)}
        className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 shadow-xl border border-border/20"
        style={{
          background: 'var(--btn-gradient)',
          boxShadow: '0 6px 24px -4px rgba(0,0,0,0.3), var(--btn-shadow)',
          animation: 'cart-pill-pulse 3s ease-in-out infinite',
        }}
      >
        {/* Salon thumbnail */}
        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
            decoding="async"
            width={28}
            height={28}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Info */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <ShoppingBag size={12} className="text-white/80" />
            <span className="text-[11px] font-heading font-semibold text-white">
              {cartCount}
            </span>
          </div>
          <span className="text-white/30 text-[10px]">·</span>
          <span className="text-[12px] font-heading font-bold text-white">
            ₹{cartTotal}
          </span>
          <span className="text-white/30 text-[10px]">·</span>
          <span className="text-[10px] font-heading font-semibold text-white/90">
            Continue
          </span>
        </div>
      </button>
    </div>
  );
};

export default CartPill;
