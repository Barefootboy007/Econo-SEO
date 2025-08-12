import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Search, TrendingUp, Target, BarChart2, Zap, Shield, Globe, LogOut } from "lucide-react"
import { Button } from "@/components/ui/shadcn-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn-card"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const { logout } = useAuth()
  const isAuthenticated = isLoggedIn()
  
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <RouterLink to="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">SEO Optimizer</span>
          </RouterLink>
          <nav className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <RouterLink to="/features" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Features
              </RouterLink>
              <RouterLink to="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Pricing
              </RouterLink>
              <RouterLink to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                About
              </RouterLink>
              <RouterLink to="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Contact
              </RouterLink>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <RouterLink to="/dashboard">Dashboard</RouterLink>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <RouterLink to="/login">Sign In</RouterLink>
                  </Button>
                  <Button asChild>
                    <RouterLink to="/signup">Get Started</RouterLink>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Supercharge Your SEO with{" "}
              <span className="text-primary">AI-Powered Optimization</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Scrape, analyze, and optimize your website content with advanced AI tools.
              Get real-time insights and recommendations to boost your search rankings.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isAuthenticated ? (
                <>
                  <Button size="lg" asChild>
                    <RouterLink to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </RouterLink>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <RouterLink to="/settings">Settings</RouterLink>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <RouterLink to="/signup">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </RouterLink>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <RouterLink to="/demo">Watch Demo</RouterLink>
                  </Button>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need for SEO Success
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our comprehensive suite of tools helps you identify opportunities,
              optimize content, and track your SEO performance.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-6 w-6 text-primary" />}
              title="Smart Web Scraping"
              description="Extract content and metadata from any website with our advanced scraping engine powered by Crawl4AI."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              title="SEO Analysis"
              description="Get comprehensive SEO audits with actionable insights on technical issues, content gaps, and optimization opportunities."
            />
            <FeatureCard
              icon={<Target className="h-6 w-6 text-primary" />}
              title="Keyword Research"
              description="Discover high-value keywords with search volume data, competition analysis, and ranking difficulty scores."
            />
            <FeatureCard
              icon={<BarChart2 className="h-6 w-6 text-primary" />}
              title="Performance Tracking"
              description="Monitor your rankings, traffic, and conversions with real-time dashboards and custom reports."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="AI Content Optimization"
              description="Optimize your content with AI-powered suggestions for titles, meta descriptions, and on-page SEO."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Technical SEO"
              description="Identify and fix technical issues like broken links, slow pages, and mobile responsiveness problems."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            <StepCard
              number="1"
              title="Add Your Website"
              description="Enter your website URL and our crawler will automatically discover and analyze all your pages."
            />
            <StepCard
              number="2"
              title="Get AI Analysis"
              description="Our AI engine analyzes your content, technical setup, and competitors to identify optimization opportunities."
            />
            <StepCard
              number="3"
              title="Optimize & Track"
              description="Implement AI-powered recommendations and track your SEO improvements with real-time monitoring."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Boost Your SEO?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of businesses using our platform to improve their search rankings
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <RouterLink to="/signup">Start Free Trial</RouterLink>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <RouterLink to="/contact">Talk to Sales</RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold text-white">SEO Optimizer</h3>
              <p className="mt-2 text-sm">
                AI-powered SEO optimization platform for modern businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <RouterLink to="/features" className="hover:text-white">Features</RouterLink>
                </li>
                <li>
                  <RouterLink to="/pricing" className="hover:text-white">Pricing</RouterLink>
                </li>
                <li>
                  <RouterLink to="/demo" className="hover:text-white">Demo</RouterLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <RouterLink to="/about" className="hover:text-white">About</RouterLink>
                </li>
                <li>
                  <RouterLink to="/blog" className="hover:text-white">Blog</RouterLink>
                </li>
                <li>
                  <RouterLink to="/contact" className="hover:text-white">Contact</RouterLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <RouterLink to="/privacy" className="hover:text-white">Privacy Policy</RouterLink>
                </li>
                <li>
                  <RouterLink to="/terms" className="hover:text-white">Terms of Service</RouterLink>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2024 SEO Optimizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
        {number}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}