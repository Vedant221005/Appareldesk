import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Shield, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Complete Apparel Management Solution
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-top-6 duration-1000 delay-200">
              <span className="text-gradient-primary">ApparelDesk</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-top-8 duration-1000 delay-300">
              Powerful inventory management, seamless order processing, and comprehensive customer management for your apparel business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-top-10 duration-1000 delay-500">
              <Link href="/shop">
                <Button size="lg" className="btn-gradient text-white hover:scale-105 transition-transform">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="hover:bg-primary/10 transition-colors">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-gradient-primary">ApparelDesk</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group">
              <div className="card-elevated card-hover bg-card p-8 rounded-xl border-2 border-transparent hover:border-primary/20 transition-all">
                <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 float-animation">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Complete Inventory</h3>
                <p className="text-muted-foreground">
                  Manage your entire product catalog with advanced filtering, bulk operations, and real-time stock tracking.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="card-elevated card-hover bg-card p-8 rounded-xl border-2 border-transparent hover:border-primary/20 transition-all">
                <div className="w-14 h-14 rounded-lg bg-gradient-accent flex items-center justify-center mb-4 float-animation" style={{animationDelay: "0.2s"}}>
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Order Management</h3>
                <p className="text-muted-foreground">
                  Track orders from placement to delivery with automated status updates, bulk processing, and invoice generation.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="card-elevated card-hover bg-card p-8 rounded-xl border-2 border-transparent hover:border-primary/20 transition-all">
                <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 float-animation" style={{animationDelay: "0.4s"}}>
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
                <p className="text-muted-foreground">
                  Built with modern security practices, role-based access control, and comprehensive reporting capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of apparel businesses already using ApparelDesk to streamline their operations.
            </p>
            <Link href="/shop">
              <Button size="lg" className="btn-gradient text-white glow-primary hover:scale-105 transition-transform">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2026 ApparelDesk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
