"use client";


import { Bell, Search,UserRoundArrowLeft } from "lucide-react";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

const handleSignOut = () => {
  signOut({ callbackUrl: "/sign-in" });
};

export default function Header({session}: {session: Session }) {
 
  return (
    <header className="border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6">
         <div className="ml-10 hidden flex-1 max-w-md md:flex">
          <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search dashboard..."
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

       
        <div className="ml-auto flex items-center gap-4">

         
          <button className="relative rounded-xl p-2 hover:bg-muted transition">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

    
          <button  className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-muted transition" >
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <UserRoundArrowLeft/> 
            
            </div>
           
          </button>
            <Button onClick={handleSignOut}  className="text-black">{session?.user?.name}</Button>
        </div>
      </div>
    </header>
  );
}