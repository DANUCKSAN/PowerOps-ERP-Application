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

   
      <div className="flex flex-1 flex-col ml-4">
        <Header session={session} />

        <main className="flex mt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;