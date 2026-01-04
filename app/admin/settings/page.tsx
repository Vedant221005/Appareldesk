"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Building, Percent } from "lucide-react"

interface Settings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  companyCity: string
  companyState: string
  companyPincode: string
  companyGST: string
  taxRate: string
  shippingFee: string
  currency: string
  invoicePrefix: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyPincode: "",
    companyGST: "",
    taxRate: "18",
    shippingFee: "0",
    currency: "₹",
    invoicePrefix: "INV",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      
      const data = await response.json()
      setSettings((prev) => ({ ...prev, ...data.settings }))
    } catch (error) {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const payload = {
        ...settings,
        taxRate: parseFloat(settings.taxRate) || 0,
        shippingFee: parseFloat(settings.shippingFee) || 0,
      }

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your store settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Details displayed on invoices and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                  placeholder="ApparelDesk Inc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, companyEmail: e.target.value })
                  }
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, companyPhone: e.target.value })
                  }
                  placeholder="+91 1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyGST">GST Number</Label>
                <Input
                  id="companyGST"
                  value={settings.companyGST}
                  onChange={(e) =>
                    setSettings({ ...settings, companyGST: e.target.value })
                  }
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={settings.companyAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, companyAddress: e.target.value })
                  }
                  placeholder="123 Business Street"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyCity">City</Label>
                  <Input
                    id="companyCity"
                    value={settings.companyCity}
                    onChange={(e) =>
                      setSettings({ ...settings, companyCity: e.target.value })
                    }
                    placeholder="Mumbai"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyState">State</Label>
                  <Input
                    id="companyState"
                    value={settings.companyState}
                    onChange={(e) =>
                      setSettings({ ...settings, companyState: e.target.value })
                    }
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPincode">Pincode</Label>
                  <Input
                    id="companyPincode"
                    value={settings.companyPincode}
                    onChange={(e) =>
                      setSettings({ ...settings, companyPincode: e.target.value })
                    }
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Pricing & Tax
            </CardTitle>
            <CardDescription>
              Default values for orders and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) =>
                    setSettings({ ...settings, taxRate: e.target.value })
                  }
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingFee">Default Shipping Fee</Label>
                <Input
                  id="shippingFee"
                  type="number"
                  step="0.01"
                  value={settings.shippingFee}
                  onChange={(e) =>
                    setSettings({ ...settings, shippingFee: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency Symbol</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  placeholder="₹"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={settings.invoicePrefix}
                  onChange={(e) =>
                    setSettings({ ...settings, invoicePrefix: e.target.value })
                  }
                  placeholder="INV"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
