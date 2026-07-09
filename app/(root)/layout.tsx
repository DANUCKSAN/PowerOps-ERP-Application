import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth } from "@/auth";
import { after } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  after(async () => {
    if (!session?.user?.id) return;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user?.id))
      .limit(1);

    return user[0];
  });

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-content">
        <Header session={session} />

        <main className="app-main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
