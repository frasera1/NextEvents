'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Sparkles, ArrowRight, Music, MapPin, Clock } from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            <span className="text-2xl font-bold">NextEvents</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="hover:opacity-90 transition-opacity">
              Features
            </Link>
            <Link href="#events" className="hover:opacity-90 transition-opacity">
              Browse Events
            </Link>
            <Link href="#about" className="hover:opacity-90 transition-opacity">
              About
            </Link>
          </div>
          <Link href="/login">
            <Button variant="secondary" size="default">
              Login
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-primary/10 to-background py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Event Discovery</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-foreground">
            Discover & Book Your
            <span className="text-primary block mt-2">Perfect Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find concerts, conferences, workshops, and more. Get personalized event recommendations powered by AI to match your interests perfectly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Explore Events
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose NextEvents?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">AI Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized event suggestions based on your interests, past bookings, and preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Easy Booking</h3>
              <p className="text-muted-foreground">
                Book tickets in seconds with our intuitive interface. Secure payments and instant confirmations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-lg border border-border bg-background hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Diverse Events</h3>
              <p className="text-muted-foreground">
                From concerts and festivals to conferences and workshops—find events for every interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Preview Section */}
      <section id="events" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Upcoming Events
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow bg-card"
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Music className="w-12 h-12 text-primary/40" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-foreground">Event Title {i}</h3>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Dec {15 + i}, 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>New York, NY</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>7:00 PM</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Next Event?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of event enthusiasts and never miss an event you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="gap-2">
                Sign Up Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Browse Events
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground">NextEvents</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered event discovery and booking platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Browse Events</Link></li>
                <li><Link href="#" className="hover:text-foreground">My Bookings</Link></li>
                <li><Link href="#" className="hover:text-foreground">Recommendations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 NextEvents. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}