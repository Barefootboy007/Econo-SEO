import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn-card'
import { Button } from '@/components/ui/shadcn-button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Settings, Zap, Shield, Globe, Save, RefreshCw } from 'lucide-react'
import useAuth from "@/hooks/useAuth"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import useCustomToast from "@/hooks/useCustomToast"
import { ScraperService, type ScraperSettings as ScraperSettingsType } from "@/client/ScraperService"

export const Route = createFileRoute("/_layout/scraper-settings")({
  component: ScraperSettings,
})

function ScraperSettings() {
  const { user } = useAuth()
  const showToast = useCustomToast()
  const queryClient = useQueryClient()
  const [selectedPreset, setSelectedPreset] = useState<string>('standard')
  const [settings, setSettings] = useState<ScraperSettingsType | null>(null)

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["scraperSettings"],
    queryFn: () => ScraperService.getSettings(),
    enabled: !!user,
  })

  // Fetch presets
  const { data: presets } = useQuery({
    queryKey: ["scraperPresets"],
    queryFn: () => ScraperService.getPresets(),
  })

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: (newSettings: ScraperSettingsType) => ScraperService.updateSettings(newSettings),
    onSuccess: () => {
      showToast("Success", "Settings saved successfully", "success")
      queryClient.invalidateQueries({ queryKey: ["scraperSettings"] })
    },
    onError: () => {
      showToast("Error", "Failed to save settings", "error")
    },
  })

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings)
    }
  }, [currentSettings])

  const handlePresetChange = (preset: string) => {
    if (presets && presets[preset]) {
      setSettings(presets[preset])
      setSelectedPreset(preset)
      showToast("Preset Loaded", `Loaded ${preset} preset`, "info")
    }
  }

  const handleSettingChange = (key: keyof ScraperSettingsType, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: value,
      })
    }
  }

  const handleSave = () => {
    if (settings) {
      updateSettings.mutate(settings)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Please sign in to access scraper settings.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Unable to load scraper settings.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Scraper Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure how your web scraper behaves when extracting SEO data
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
          <CardDescription>
            Choose a preset configuration optimized for different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets && Object.keys(presets).map((preset) => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? 'default' : 'outline'}
                onClick={() => handlePresetChange(preset)}
                className="capitalize"
              >
                {preset === 'fast' && <Zap className="h-4 w-4 mr-2" />}
                {preset === 'stealth' && <Shield className="h-4 w-4 mr-2" />}
                {preset === 'thorough' && <Globe className="h-4 w-4 mr-2" />}
                {preset}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="extraction">Extraction</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Browser Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Browser Type</Label>
                  <Select
                    value={settings.browser_type}
                    onValueChange={(value) => handleSettingChange('browser_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chromium">Chromium</SelectItem>
                      <SelectItem value="firefox">Firefox</SelectItem>
                      <SelectItem value="webkit">WebKit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="headless">Headless Mode</Label>
                  <Switch
                    id="headless"
                    checked={settings.headless}
                    onCheckedChange={(checked) => handleSettingChange('headless', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Viewport Width</Label>
                  <Input
                    type="number"
                    value={settings.viewport_width}
                    onChange={(e) => handleSettingChange('viewport_width', parseInt(e.target.value))}
                    min={800}
                    max={3840}
                  />
                </div>
                <div>
                  <Label>Viewport Height</Label>
                  <Input
                    type="number"
                    value={settings.viewport_height}
                    onChange={(e) => handleSettingChange('viewport_height', parseInt(e.target.value))}
                    min={600}
                    max={2160}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="js">JavaScript Execution</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable for dynamic content
                  </p>
                </div>
                <Switch
                  id="js"
                  checked={settings.js_enabled}
                  onCheckedChange={(checked) => handleSettingChange('js_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timing & Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Wait Timeout (ms)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.wait_for_timeout]}
                    onValueChange={(value) => handleSettingChange('wait_for_timeout', value[0])}
                    max={30000}
                    step={1000}
                    className="flex-1"
                  />
                  <Badge>{settings.wait_for_timeout}ms</Badge>
                </div>
              </div>

              <div>
                <Label>Page Timeout (ms)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.page_timeout]}
                    onValueChange={(value) => handleSettingChange('page_timeout', value[0])}
                    min={5000}
                    max={120000}
                    step={5000}
                    className="flex-1"
                  />
                  <Badge>{settings.page_timeout}ms</Badge>
                </div>
              </div>

              <div>
                <Label>Delay Between Requests (ms)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.delay_between_requests]}
                    onValueChange={(value) => handleSettingChange('delay_between_requests', value[0])}
                    max={10000}
                    step={500}
                    className="flex-1"
                  />
                  <Badge>{settings.delay_between_requests}ms</Badge>
                </div>
              </div>

              <div>
                <Label>Max Retries</Label>
                <Select
                  value={settings.max_retries.toString()}
                  onValueChange={(value) => handleSettingChange('max_retries', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 5, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'retry' : 'retries'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cache">Enable Cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache scraped pages for faster re-scraping
                  </p>
                </div>
                <Switch
                  id="cache"
                  checked={settings.cache_enabled}
                  onCheckedChange={(checked) => handleSettingChange('cache_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extraction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Extraction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="markdown">Extract Markdown</Label>
                    <p className="text-sm text-muted-foreground">
                      Convert HTML to clean markdown
                    </p>
                  </div>
                  <Switch
                    id="markdown"
                    checked={settings.extract_markdown}
                    onCheckedChange={(checked) => handleSettingChange('extract_markdown', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="links">Extract Links</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze internal and external links
                    </p>
                  </div>
                  <Switch
                    id="links"
                    checked={settings.extract_links}
                    onCheckedChange={(checked) => handleSettingChange('extract_links', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="images">Extract Images</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze image tags and alt text
                    </p>
                  </div>
                  <Switch
                    id="images"
                    checked={settings.extract_images}
                    onCheckedChange={(checked) => handleSettingChange('extract_images', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="structured">Extract Structured Data</Label>
                    <p className="text-sm text-muted-foreground">
                      JSON-LD and schema.org data
                    </p>
                  </div>
                  <Switch
                    id="structured"
                    checked={settings.extract_structured_data}
                    onCheckedChange={(checked) => handleSettingChange('extract_structured_data', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="media">Extract Media</Label>
                    <p className="text-sm text-muted-foreground">
                      Videos, audio, and other media
                    </p>
                  </div>
                  <Switch
                    id="media"
                    checked={settings.extract_media}
                    onCheckedChange={(checked) => handleSettingChange('extract_media', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screenshot">Take Screenshots</Label>
                    <p className="text-sm text-muted-foreground">
                      Capture page screenshots
                    </p>
                  </div>
                  <Switch
                    id="screenshot"
                    checked={settings.screenshot}
                    onCheckedChange={(checked) => handleSettingChange('screenshot', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anti-Detection & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cloudflare">Bypass Cloudflare</Label>
                  <p className="text-sm text-muted-foreground">
                    Attempt to bypass Cloudflare protection
                  </p>
                </div>
                <Switch
                  id="cloudflare"
                  checked={settings.bypass_cloudflare}
                  onCheckedChange={(checked) => handleSettingChange('bypass_cloudflare', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stealth">Stealth Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Advanced anti-detection measures
                  </p>
                </div>
                <Switch
                  id="stealth"
                  checked={settings.stealth_mode}
                  onCheckedChange={(checked) => handleSettingChange('stealth_mode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="overlay">Remove Overlays</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove popups and overlays
                  </p>
                </div>
                <Switch
                  id="overlay"
                  checked={settings.remove_overlay}
                  onCheckedChange={(checked) => handleSettingChange('remove_overlay', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => setSettings(currentSettings)}
          disabled={!currentSettings}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default ScraperSettings