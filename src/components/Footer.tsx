import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About EventEase */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">EventEase</h3>
            <p className="text-gray-300 mb-4">
              A modern event management platform that simplifies event creation, 
              management, and RSVP tracking. Built with cutting-edge technologies 
              for seamless user experience.
            </p>
            <div className="flex space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Next.js 15
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Prisma
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                PostgreSQL
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/create-event" className="text-gray-300 hover:text-white transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/my-events" className="text-gray-300 hover:text-white transition-colors">
                  My Events
                </Link>
              </li>
              <li>
                <Link href="/signin" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Developer</h4>
            <p className="text-gray-300 mb-4">
              Created by <span className="font-semibold text-white">Md Shaaz Ahmed</span>
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/CodewithShaaz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/md-shaaz-ahmed/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="mailto:shaazahmed.ksa@gmail.com"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Email Contact"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EventEase. Built with ❤️ by Md Shaaz Ahmed.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
