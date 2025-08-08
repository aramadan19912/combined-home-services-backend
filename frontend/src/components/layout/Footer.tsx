import { Home, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">ServiceHub</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Connecting customers with trusted home service professionals across your area.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>support@servicehub.com</span>
            </div>
          </div>

          {/* For Customers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Customers</h3>
            <div className="space-y-2">
              <Link to="/services" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Services
              </Link>
              <Link to="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/customer/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
              <Link to="/support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Customer Support
              </Link>
            </div>
          </div>

          {/* For Providers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Providers</h3>
            <div className="space-y-2">
              <Link to="/provider/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Become a Provider
              </Link>
              <Link to="/provider/requirements" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Requirements
              </Link>
              <Link to="/provider/resources" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
              <Link to="/provider/support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Provider Support
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/careers" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ServiceHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};