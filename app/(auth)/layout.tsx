import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="grid grid-cols-2 min-h-screen">
     
        <div className="flex flex-col p-5 justify-center items-center bg-amber-200">
          <div>
            <Link href="/">
              <Image
                src="/images/logo1.svg"
                alt="PowerOps Logo"
                width={100}
                height={100}
                priority
                className="mb-4"
              />

              <span className="text-red-600">PowerOps</span>
            </Link>
          </div>

          <div className="mt-10 max-w-md">
            <p className="text-red-600">Internal ERP Platform</p>

            <h1 className="text-4xl font-bold text-foreground mt-2">
              Control inventory, projects, and operations from one place.
            </h1>

            <p className="mt-4 text-sm text-muted-foreground">
              PowerOps helps Electrifying Australia manage solar inventory,
              purchase orders, suppliers, installation projects, payments,
              returns, and operational reporting through one secure internal
              system.
            </p>

            </div>
          </div>

    
        <div className="p-6 flex flex-col justify-center bg-background">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/images/logo1.svg"
              alt="PowerOps Logo"
              width={100}
              height={100}
              priority

            />
            <h1 className="text-2xl font-bold text-foreground">PowerOps</h1>
          </div>

          <div>{children}</div>
        </div>
     
    </main>
  );
};

export default AuthLayout;