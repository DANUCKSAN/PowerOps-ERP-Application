import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth } from "@/auth";
import {after} from 'next/server'
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { redirect } from "next/dist/client/components/navigation";

const Layout= async({ children }: { children: React.ReactNode }) =>{
  const session =await auth();
  if (!session) redirect("/sign-in");
  after(async () => {
    if (!session?.user?.id) return;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user?.id))
      .limit(1);
     
      return user[0];
  }
  
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      

      <Sidebar />

   
      <div className="flex min-w-0 flex-1 flex-col">
        <Header session={session} />

        <main className="flex w-full flex-1 mt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
