import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="auth-layout">
      <section className="auth-grid">
        <div className="auth-brand-panel">
          <div>
            <Link href="/" className="auth-logo-link">
              <Image
                src="/images/logo1.svg"
                alt="PowerOps Logo"
                width={56}
                height={56}
                priority
              />

              <span className="auth-logo-text">PowerOps</span>
            </Link>
          </div>

          <div className="auth-brand-content">
            <p className="auth-eyebrow">Internal ERP Platform</p>

            <h1 className="auth-title">
              Control inventory, projects, and operations from one place.
            </h1>

            <p className="auth-description">
              PowerOps helps Electrifying Australia manage solar inventory,
              purchase orders, suppliers, installation projects, payments,
              returns, and operational reporting through one secure internal
              system.
            </p>

            <div className="auth-stats-grid">
              <div className="auth-stat-card">
                <p className="auth-stat-value">100%</p>
                <p className="auth-stat-label">Internal business control</p>
              </div>

              <div className="auth-stat-card">
                <p className="auth-stat-value">ERP</p>
                <p className="auth-stat-label">Built for solar operations</p>
              </div>
            </div>
          </div>

          <p className="auth-footer-text">
            © {new Date().getFullYear()} PowerOps. Electrifying Australia.
          </p>
        </div>

        {/* Right Side - Auth Form */}
        <div className="auth-form-panel">
          <div className="auth-mobile-brand">
            <Image
              src="/images/logo1.svg"
              alt="PowerOps Logo"
              width={52}
              height={52}
              priority
            />
            <h1 className="auth-mobile-title">PowerOps</h1>
          </div>

          <div className="auth-form-wrapper">{children}</div>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;