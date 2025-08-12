import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { 
  Search, TrendingUp, Target, BarChart2, Zap, Shield,
  Globe, Database, Cpu, CheckCircle, AlertCircle, Link,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/shadcn-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
})

function FeaturesPage() {
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
              <RouterLink to="/features" className="transition-colors hover:text-foreground/80 text-foreground">
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

      {/* Features Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Powerful Features for SEO Excellence
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to analyze, optimize, and monitor your website's SEO performance in one comprehensive platform.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20">
        <div className="container">
          <Tabs defaultValue="scraping" className="mx-auto max-w-5xl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scraping">Web Scraping</TabsTrigger>
              <TabsTrigger value="analysis">SEO Analysis</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="scraping" className="mt-8">
              <FeatureSection
                title="Advanced Web Scraping"
                description="Extract comprehensive data from any website with our powerful scraping engine"
                features={[
                  {
                    icon: <Globe className="h-6 w-6" />,
                    title: "Multi-Page Crawling",
                    description: "Automatically discover and crawl all pages on a website with intelligent link following"
                  },
                  {
                    icon: <Database className="h-6 w-6" />,
                    title: "Structured Data Extraction",
                    description: "Extract metadata, content, images, and structured data in organized formats"
                  },
                  {
                    icon: <Cpu className="h-6 w-6" />,
                    title: "JavaScript Rendering",
                    description: "Full support for modern JavaScript frameworks and dynamic content loading"
                  },
                  {
                    icon: <Zap className="h-6 w-6" />,
                    title: "High-Speed Processing",
                    description: "Concurrent crawling with rate limiting and respectful scraping practices"
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="analysis" className="mt-8">
              <FeatureSection
                title="Comprehensive SEO Analysis"
                description="Get deep insights into your website's SEO performance and opportunities"
                features={[
                  {
                    icon: <CheckCircle className="h-6 w-6" />,
                    title: "Technical SEO Audit",
                    description: "Identify technical issues affecting crawlability, indexability, and performance"
                  },
                  {
                    icon: <Target className="h-6 w-6" />,
                    title: "Content Analysis",
                    description: "Evaluate content quality, keyword density, readability, and semantic relevance"
                  },
                  {
                    icon: <Link className="h-6 w-6" />,
                    title: "Link Analysis",
                    description: "Analyze internal and external links, anchor text distribution, and link equity"
                  },
                  {
                    icon: <AlertCircle className="h-6 w-6" />,
                    title: "Issue Detection",
                    description: "Automatically detect broken links, duplicate content, and missing meta tags"
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="optimization" className="mt-8">
              <FeatureSection
                title="AI-Powered Optimization"
                description="Leverage artificial intelligence to optimize your content and improve rankings"
                features={[
                  {
                    icon: <Zap className="h-6 w-6" />,
                    title: "Smart Recommendations",
                    description: "Get AI-powered suggestions for titles, meta descriptions, and content improvements"
                  },
                  {
                    icon: <Target className="h-6 w-6" />,
                    title: "Keyword Optimization",
                    description: "Identify keyword opportunities and optimize content for search intent"
                  },
                  {
                    icon: <TrendingUp className="h-6 w-6" />,
                    title: "Competitor Analysis",
                    description: "Analyze competitor strategies and identify gaps in your content"
                  },
                  {
                    icon: <Shield className="h-6 w-6" />,
                    title: "Schema Markup",
                    description: "Generate and validate structured data for enhanced search results"
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="monitoring" className="mt-8">
              <FeatureSection
                title="Real-Time Monitoring"
                description="Track your SEO performance and get alerts for important changes"
                features={[
                  {
                    icon: <BarChart2 className="h-6 w-6" />,
                    title: "Ranking Tracking",
                    description: "Monitor keyword rankings across search engines and locations"
                  },
                  {
                    icon: <TrendingUp className="h-6 w-6" />,
                    title: "Traffic Analytics",
                    description: "Track organic traffic, conversions, and user behavior metrics"
                  },
                  {
                    icon: <AlertCircle className="h-6 w-6" />,
                    title: "Alert System",
                    description: "Get instant notifications for ranking changes and technical issues"
                  },
                  {
                    icon: <Database className="h-6 w-6" />,
                    title: "Historical Data",
                    description: "Access historical performance data and trend analysis"
                  }
                ]}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Integration Section */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Seamless Integrations</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect with your favorite tools and platforms to streamline your SEO workflow
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              <IntegrationCard name="Google Analytics" />
              <IntegrationCard name="Search Console" />
              <IntegrationCard name="WordPress" />
              <IntegrationCard name="Shopify" />
              <IntegrationCard name="Slack" />
              <IntegrationCard name="Zapier" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Experience the Power of AI-Driven SEO
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Start your free trial today and see how our platform can transform your SEO strategy
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <RouterLink to="/signup">Start Free Trial</RouterLink>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <RouterLink to="/demo">Request Demo</RouterLink>
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

interface FeatureSectionProps {
  title: string
  description: string
  features: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
}

function FeatureSection({ title, description, features }: FeatureSectionProps) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

function IntegrationCard({ name }: { name: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="mb-2 h-12 w-12 rounded-md bg-gray-200" />
        <p className="text-xs font-medium">{name}</p>
      </CardContent>
    </Card>
  )
}