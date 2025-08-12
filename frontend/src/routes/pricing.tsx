import { Box, Container, Heading, Text, VStack, HStack, Button, SimpleGrid, Card, List, Flex } from "@chakra-ui/react"
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { FiCheck } from "react-icons/fi"

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
})

function PricingPage() {
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

      {/* Pricing Header */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack gap={6} textAlign="center">
            <Heading size="4xl">Simple, Transparent Pricing</Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Box py={20}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
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
              buttonVariant="solid"
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
          </SimpleGrid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="4xl">
          <VStack gap={12}>
            <Heading size="3xl" textAlign="center">Frequently Asked Questions</Heading>
            
            <VStack gap={8} w="full" align="start">
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
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20}>
        <Container maxW="4xl">
          <VStack gap={6} textAlign="center">
            <Heading size="3xl">Start Your 14-Day Free Trial</Heading>
            <Text fontSize="lg" color="gray.600">
              No credit card required. Get instant access to all features.
            </Text>
            <RouterLink to="/signup">
              <Button colorPalette="blue" size="lg">
                Get Started Now
              </Button>
            </RouterLink>
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

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: "solid" | "outline"
  isPopular?: boolean
}

function PricingCard({ name, price, period, description, features, buttonText, buttonVariant, isPopular }: PricingCardProps) {
  return (
    <Card.Root position="relative" borderWidth={isPopular ? 2 : 1} borderColor={isPopular ? "blue.500" : "gray.200"}>
      {isPopular && (
        <Box
          position="absolute"
          top="-12px"
          left="50%"
          transform="translateX(-50%)"
          bg="blue.600"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="bold"
        >
          MOST POPULAR
        </Box>
      )}
      
      <Card.Body>
        <VStack gap={6} align="stretch">
          <VStack gap={2}>
            <Heading size="lg">{name}</Heading>
            <HStack justify="center">
              <Text fontSize="4xl" fontWeight="bold">{price}</Text>
              <Text color="gray.600">/{period}</Text>
            </HStack>
            <Text color="gray.600" textAlign="center">{description}</Text>
          </VStack>
          
          <List.Root variant="plain" gap={3}>
            {features.map((feature, index) => (
              <List.Item key={index}>
                <List.Indicator asChild color="green.500">
                  <FiCheck />
                </List.Indicator>
                {feature}
              </List.Item>
            ))}
          </List.Root>
          
          <RouterLink to="/signup">
            <Button 
              colorPalette={buttonVariant === "solid" ? "blue" : undefined}
              variant={buttonVariant}
              size="lg"
              w="full"
            >
              {buttonText}
            </Button>
          </RouterLink>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <VStack align="start" gap={2} w="full">
      <Heading size="md">{question}</Heading>
      <Text color="gray.600">{answer}</Text>
    </VStack>
  )
}