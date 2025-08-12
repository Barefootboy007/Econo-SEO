import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { Check, LogOut } from "lucide-react"
import { Button } from "@/components/ui/shadcn-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/shadcn-card"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
})

function PricingPage() {
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
              <RouterLink to="/pricing" className="transition-colors hover:text-foreground/80 text-foreground">
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

      {/* Pricing Header */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter Plan */}
            <PricingCard
              name="Starter"
              price="$29"
              period="per month"
              description="Perfect for small businesses and personal websites"
              features={[
                "Up to 500 pages analyzed",
                "5 websites",
                "Basic SEO analysis",
                "Keyword research (100/month)",
                "Weekly reports",
                "Email support",
              ]}
              buttonText="Start Free Trial"
              buttonVariant="outline"
            />

            {/* Professional Plan */}
            <PricingCard
              name="Professional"
              price="$99"
              period="per month"
              description="For growing businesses and marketing teams"
              features={[
                "Up to 5,000 pages analyzed",
                "25 websites",
                "Advanced SEO analysis",
                "Keyword research (1,000/month)",
                "Daily reports",
                "Priority email support",
                "API access",
                "Custom dashboards",
              ]}
              buttonText="Start Free Trial"
              buttonVariant="default"
              isPopular={true}
            />

            {/* Enterprise Plan */}
            <PricingCard
              name="Enterprise"
              price="Custom"
              period="contact sales"
              description="For large organizations with custom needs"
              features={[
                "Unlimited pages analyzed",
                "Unlimited websites",
                "Enterprise SEO suite",
                "Unlimited keyword research",
                "Real-time monitoring",
                "24/7 phone & email support",
                "Full API access",
                "Custom integrations",
                "Dedicated account manager",
                "SLA guarantee",
              ]}
              buttonText="Contact Sales"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-8">
              <FAQItem
                question="Can I change plans anytime?"
                answer="Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, PayPal, and wire transfers for enterprise accounts."
              />
              <FAQItem
                question="Do you offer refunds?"
                answer="Yes, we offer a 30-day money-back guarantee on all plans. No questions asked."
              />
              <FAQItem
                question="Can I cancel my subscription?"
                answer="You can cancel your subscription anytime from your account settings. You'll continue to have access until the end of your billing period."
              />
              <FAQItem
                question="Do you offer discounts for annual billing?"
                answer="Yes! Save 20% when you pay annually. That's 2 months free on all plans."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start Your 14-Day Free Trial
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              No credit card required. Get instant access to all features.
            </p>
            <div className="mt-10">
              <Button size="lg" variant="secondary" asChild>
                <RouterLink to="/signup">Get Started Now</RouterLink>
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

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: "default" | "outline" | "secondary"
  isPopular?: boolean
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  buttonText, 
  buttonVariant, 
  isPopular 
}: PricingCardProps) {
  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="mr-2 mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant={buttonVariant}
          className="w-full"
          size="lg"
          asChild
        >
          <RouterLink to="/signup">{buttonText}</RouterLink>
        </Button>
      </CardFooter>
    </Card>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{question}</h3>
      <p className="mt-2 text-muted-foreground">{answer}</p>
    </div>
  )
}