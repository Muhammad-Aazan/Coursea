import { Link } from "react-router-dom";
import { GraduationCap, Share2, Globe, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Coursea Logo"
                className="h-9 w-auto object-contain rounded-md bg-white p-0.5"
              />
              <span className="text-2xl font-black text-white tracking-tight">
                Coursea
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering lifelong learners worldwide with expert-led courses in technology, business, design, and career development.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Courses
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  All Courses Catalog
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Culinary+%26+Cooking" className="hover:text-white transition-colors">
                  Culinary & Cooking
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Baking+%26+Pastry+Arts" className="hover:text-white transition-colors">
                  Baking & Pastry Arts
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Automotive+%26+Mechanics" className="hover:text-white transition-colors">
                  Automotive & Mechanics
                </Link>
              </li>
              <li>
                <Link to="/courses?maxPrice=0" className="hover:text-emerald-400 text-emerald-500 font-semibold transition-colors">
                  Free Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Help & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/register?role=instructor" className="hover:text-blue-400 text-blue-400 font-semibold transition-colors">
                  Teach on Coursea
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Stay Connected
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Get the latest courses, skills guides, and discount alerts delivered straight to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Coursea LMS, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/faq" className="hover:text-slate-400">FAQ</Link>
            <Link to="/contact" className="hover:text-slate-400">Contact</Link>
            <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for lifelong learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
