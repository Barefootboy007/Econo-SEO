import { Box, Container, Heading, Text, VStack, HStack, Button, SimpleGrid, Card, Flex, Tabs, Image } from "@chakra-ui/react"
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { 
  FiSearch, FiTrendingUp, FiTarget, FiBarChart2, FiZap, FiShield,
  FiGlobe, FiDatabase, FiCpu, FiCheckCircle, FiAlertCircle, FiLink
} from "react-icons/fi"

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
})

function FeaturesPage() {
  return (
    <Box minH="100vh">
      {/* Navigation Header */}
      <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <RouterLink to="/">
              <Heading size="lg" color="blue.600">SEO Optimizer</Heading>
            </RouterLink>
            <HStack gap={4}>
              <RouterLink to="/features">Features</RouterLink>
              <RouterLink to="/pricing">Pricing</RouterLink>
              <RouterLink to="/about">About</RouterLink>
              <RouterLink to="/contact">Contact</RouterLink>
              <RouterLink to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </RouterLink>
              <RouterLink to="/signup">
                <Button colorPalette="blue" size="sm">Get Started</Button>
              </RouterLink>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Features Header */}
      <Box bg="gradient.to-br" bgGradient="to-br" bgGradientFrom="blue.50" bgGradientTo="purple.50" py={20}>
        <Container maxW="7xl">
          <VStack gap={6} textAlign="center">
            <Heading size="4xl">Powerful Features for SEO Excellence</Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              Everything you need to analyze, optimize, and monitor your website's SEO performance in one comprehensive platform.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Feature Categories */}
      <Box py={20}>
        <Container maxW="7xl">
          <Tabs.Root defaultValue="scraping" variant="subtle">
            <Tabs.List justify="center" mb={12}>
              <Tabs.Trigger value="scraping">Web Scraping</Tabs.Trigger>
              <Tabs.Trigger value="analysis">SEO Analysis</Tabs.Trigger>
              <Tabs.Trigger value="optimization">Optimization</Tabs.Trigger>
              <Tabs.Trigger value="monitoring">Monitoring</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="scraping">
              <FeatureSection
                title="Advanced Web Scraping"
                description="Extract comprehensive data from any website with our powerful scraping engine"
                features={[
                  {
                    icon: <FiGlobe />,
                    title: "Multi-Page Crawling",
                    description: "Automatically discover and crawl all pages on a website with intelligent link following"
                  },
                  {
                    icon: <FiDatabase />,
                    title: "Structured Data Extraction",
                    description: "Extract metadata, content, images, and structured data in organized formats"
                  },
                  {
                    icon: <FiCpu />,
                    title: "JavaScript Rendering",
                    description: "Full support for modern JavaScript frameworks and dynamic content loading"
                  },
                  {
                    icon: <FiZap />,
                    title: "High-Speed Processing",
                    description: "Concurrent crawling with rate limiting and respectful scraping practices"
                  }
                ]}
              />
            </Tabs.Content>

            <Tabs.Content value="analysis">
              <FeatureSection
                title="Comprehensive SEO Analysis"
                description="Get deep insights into your website's SEO performance and opportunities"
                features={[
                  {
                    icon: <FiCheckCircle />,
                    title: "Technical SEO Audit",
                    description: "Identify technical issues affecting crawlability, indexability, and performance"
                  },
                  {
                    icon: <FiTarget />,
                    title: "Content Analysis",
                    description: "Evaluate content quality, keyword density, readability, and semantic relevance"
                  },
                  {
                    icon: <FiLink />,
                    title: "Link Analysis",
                    description: "Analyze internal and external links, anchor text distribution, and link equity"
                  },
                  {
                    icon: <FiAlertCircle />,
                    title: "Issue Detection",
                    description: "Automatically detect broken links, duplicate content, and missing meta tags"
                  }
                ]}
              />
            </Tabs.Content>

            <Tabs.Content value="optimization">
              <FeatureSection
                title="AI-Powered Optimization"
                description="Leverage artificial intelligence to optimize your content and improve rankings"
                features={[
                  {
                    icon: <FiZap />,
                    title: "Smart Recommendations",
                    description: "Get AI-powered suggestions for titles, meta descriptions, and content improvements"
                  },
                  {
                    icon: <FiTarget />,
                    title: "Keyword Optimization",
                    description: "Identify keyword opportunities and optimize content for search intent"
                  },
                  {
                    icon: <FiTrendingUp />,
                    title: "Competitor Analysis",
                    description: "Analyze competitor strategies and identify gaps in your content"
                  },
                  {
                    icon: <FiShield />,
                    title: "Schema Markup",
                    description: "Generate and validate structured data for enhanced search results"
                  }
                ]}
              />
            </Tabs.Content>

            <Tabs.Content value="monitoring">
              <FeatureSection
                title="Real-Time Monitoring"
                description="Track your SEO performance and get alerts for important changes"
                features={[
                  {
                    icon: <FiBarChart2 />,
                    title: "Ranking Tracking",
                    description: "Monitor keyword rankings across search engines and locations"
                  },
                  {
                    icon: <FiTrendingUp />,
                    title: "Traffic Analytics",
                    description: "Track organic traffic, conversions, and user behavior metrics"
                  },
                  {
                    icon: <FiAlertCircle />,
                    title: "Alert System",
                    description: "Get instant notifications for ranking changes and technical issues"
                  },
                  {
                    icon: <FiDatabase />,
                    title: "Historical Data",
                    description: "Access historical performance data and trend analysis"
                  }
                ]}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Container>
      </Box>

      {/* Integration Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack gap={12}>
            <VStack gap={4} textAlign="center">
              <Heading size="3xl">Seamless Integrations</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Connect with your favorite tools and platforms to streamline your SEO workflow
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={8} w="full">
              <IntegrationCard name="Google Analytics" />
              <IntegrationCard name="Search Console" />
              <IntegrationCard name="WordPress" />
              <IntegrationCard name="Shopify" />
              <IntegrationCard name="Slack" />
              <IntegrationCard name="Zapier" />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="blue.600" color="white" py={20}>
        <Container maxW="4xl">
          <VStack gap={6} textAlign="center">
            <Heading size="3xl">Experience the Power of AI-Driven SEO</Heading>
            <Text fontSize="lg" opacity={0.9}>
              Start your free trial today and see how our platform can transform your SEO strategy
            </Text>
            <HStack gap={4}>
              <RouterLink to="/signup">
                <Button colorPalette="white" size="lg" bg="white" color="blue.600">
                  Start Free Trial
                </Button>
              </RouterLink>
              <RouterLink to="/demo">
                <Button variant="outline" size="lg" borderColor="white" color="white">
                  Request Demo
                </Button>
              </RouterLink>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="gray.400" py={12}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} gap={8}>
            <VStack align="start">
              <Heading size="md" color="white">SEO Optimizer</Heading>
              <Text fontSize="sm">
                AI-powered SEO optimization platform for modern businesses.
              </Text>
            </VStack>
            
            <VStack align="start">
              <Text fontWeight="bold" color="white">Product</Text>
              <RouterLink to="/features">Features</RouterLink>
              <RouterLink to="/pricing">Pricing</RouterLink>
              <RouterLink to="/demo">Demo</RouterLink>
            </VStack>
            
            <VStack align="start">
              <Text fontWeight="bold" color="white">Company</Text>
              <RouterLink to="/about">About</RouterLink>
              <RouterLink to="/blog">Blog</RouterLink>
              <RouterLink to="/contact">Contact</RouterLink>
            </VStack>
            
            <VStack align="start">
              <Text fontWeight="bold" color="white">Legal</Text>
              <RouterLink to="/privacy">Privacy Policy</RouterLink>
              <RouterLink to="/terms">Terms of Service</RouterLink>
            </VStack>
          </SimpleGrid>
          
          <Box borderTop="1px" borderColor="gray.800" mt={12} pt={8} textAlign="center">
            <Text fontSize="sm">© 2024 SEO Optimizer. All rights reserved.</Text>
          </Box>
        </Container>
      </Box>
    </Box>
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
    <VStack gap={12}>
      <VStack gap={4} textAlign="center">
        <Heading size="2xl">{title}</Heading>
        <Text fontSize="lg" color="gray.600" maxW="2xl">
          {description}
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w="full">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </SimpleGrid>
    </VStack>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card.Root>
      <Card.Body>
        <HStack align="start" gap={4}>
          <Box color="blue.600" fontSize="2xl" flexShrink={0}>
            {icon}
          </Box>
          <VStack align="start" gap={2}>
            <Heading size="md">{title}</Heading>
            <Text color="gray.600">{description}</Text>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}

function IntegrationCard({ name }: { name: string }) {
  return (
    <Card.Root>
      <Card.Body>
        <VStack gap={2}>
          <Box w={12} h={12} bg="gray.200" borderRadius="md" />
          <Text fontSize="sm" fontWeight="medium">{name}</Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}