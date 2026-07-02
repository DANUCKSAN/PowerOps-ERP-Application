import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { Boxes, ShieldCheck, TrendingUp } from "lucide-react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link href="/" className="auth-brand-logo">
              <Image
                src="/images/logo1.svg"
                alt="PowerOps Logo"
              width={132}
              height={40}
                priority
              className="h-10 w-auto"
              />
            </Link>

          <div className="auth-brand-copy">
            <p className="auth-kicker">Internal ERP Platform</p>

            <h1 className="auth-brand-title">
              Control inventory, projects, and operations from one place.
            </h1>

            <p className="auth-brand-description">
              PowerOps helps Electrifying Australia manage solar inventory,
              purchase orders, suppliers, installation projects, payments,
              returns, and operational reporting through one secure internal
              system.
            </p>
          </div>

          <div className="auth-feature-grid" aria-label="PowerOps capabilities">
            <div className="auth-feature-card">
              <Boxes className="size-5" />
              <div>
                <span>Inventory</span>
                <p>Stock, warehouses, and product flow.</p>
              </div>
            </div>

            <div className="auth-feature-card">
              <TrendingUp className="size-5" />
              <div>
                <span>Operations</span>
                <p>Projects, orders, and supplier tracking.</p>
              </div>
            </div>

            <div className="auth-feature-card">
              <ShieldCheck className="size-5" />
              <div>
                <span>Secure</span>
                <p>Role-based internal access.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-mobile-logo">
            <Image
              src="/images/logo1.svg"
              alt="PowerOps Logo"
            width={132}
            height={40}
              priority
            className="h-10 w-auto"
            />
          </div>

        {children}
      </section>
    </main>
  );
};

export default AuthLayout;
