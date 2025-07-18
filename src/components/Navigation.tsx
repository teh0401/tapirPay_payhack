import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantMode } from "@/contexts/MerchantModeContext";
import { 
  Home, 
  QrCode, 
  Store, 
  Receipt, 
  User,
  Scan,
  TreePine
} from "lucide-react";

export function Navigation() {
  const location = useLocation();
  const { user } = useAuth();
  const { isMerchantMode } = useMerchantMode();

  // Don't show navigation on auth page or if user is not authenticated
  if (location.pathname === '/auth' || !user) {
    return null;
  }

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    // Show scan button only in normal user mode
    ...(!isMerchantMode ? [{ path: "/scanner", icon: Scan, label: "Scan" }] : []),
    // Show sell button only in merchant mode
    ...(isMerchantMode ? [{ path: "/seller", icon: Store, label: "Sell" }] : []),
    { path: "/transactions", icon: Receipt, label: "History" },
    { path: "/esg", icon: TreePine, label: "ESG" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              location.pathname === path
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}