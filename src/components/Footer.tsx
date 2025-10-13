import { Shield, MapPin, Phone, Mail, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-border mt-12">
      <div className="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
        
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">TouristGuard</span>
          </div>
          <p className="text-muted-foreground">
            AI-powered smart travel companion ensuring safety, weather insights, and real-time crowd monitoring — anywhere in the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-foreground">Quick Links</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="/dashboard" className="hover:text-primary transition">Dashboard</a></li>
            <li><a href="/report" className="hover:text-primary transition">Report Incident</a></li>
            <li><a href="/analytics" className="hover:text-primary transition">Analytics</a></li>
            <li><a href="/signin" className="hover:text-primary transition">Sign In</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3 text-foreground">Contact</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Global HQ, Anywhere</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (800) 123-4567</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@touristguard.ai</li>
            <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> www.touristguard.ai</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TouristGuard AI · Travel smarter, safer, together 🌍
      </div>
    </footer>
  );
};

export default Footer;
