import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="root-container">
          <Header />
          <Sidebar/>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}