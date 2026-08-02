import { AuthContext } from "@/app/auth/authContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";

export default function UserMenu({ onSignOut }) {
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser?.user || null;

  const menuItems = [
    { label: 'Profile', href: '/profile' },
    { label: 'Orders', href: '/my-orders' },
    { label: 'Address', href: '/my-addresses' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-0 font-normal text-black hover:underline bg-white hover:bg-white"
        >
          <span className="uppercase text-[11px] tracking-[0.1em]">
            Account
            {/* {currentUser?.fullName?.split(' ')[0] || currentUser?.phoneNumber || "Account"} */}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="center" 
        className="w-48 p-1 bg-white border border-neutral-200 shadow-sm rounded-none"
        sideOffset={4}
      >
        {/* User Info Header */}
        <div className="px-3 py-2 border-b border-neutral-100">
          <p className="text-xs font-medium text-neutral-900 truncate">
            {currentUser?.fullName || 'Account'}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            {currentUser?.email || currentUser?.phoneNumber || ''}
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} asChild>
              <Link
                href={item.href}
                className="px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors duration-150 font-normal tracking-wide"
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Become Seller */}
        <div className="py-1 border-t border-neutral-100">
          <DropdownMenuItem asChild>
            <Link
              href="/posting"
              className="px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors duration-150 font-normal tracking-wide"
            >
              Post
            </Link>
          </DropdownMenuItem>
             <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors duration-150 font-normal tracking-wide"
            >
              Dashboard
            </Link>
          </DropdownMenuItem>
             <DropdownMenuItem asChild>
            <Link
              href="/dashboard/inventory"
              className="px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors duration-150 font-normal tracking-wide"
            >
              Inventory
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/partnership"
              className="px-3 py-2 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors duration-150 font-normal tracking-wide"
            >
              Retail Partnership
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Sign Out */}
        <div className="py-1 border-t border-neutral-100">
          <DropdownMenuItem 
            onClick={onSignOut}
            className="px-3 py-2 text-xs text-neutral-700 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150 font-normal tracking-wide"
          >
            <LogOut className="h-3 w-3 mr-2 opacity-70" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}