import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col ml-4">
        <Header />

        <main className="flex mt-4">
          {children}
        </main>
      </div>
    </div>
  );
}