'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function SettingsForm() {
  const [nodeSize, setNodeSize] = useState([100])
  const [edgeThickness, setEdgeThickness] = useState([2])
  const [colorblindMode, setColorblindMode] = useState(false)
  const [layout, setLayout] = useState('force-directed')

  const handleSave = async () => {
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeSize: nodeSize[0],
          edgeThickness: edgeThickness[0],
          colorblindMode,
          layout,
        }),
      })
    } catch (error) {
      console.error('[v0] Failed to save settings:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Graph Appearance</CardTitle>
          <CardDescription>
            Customize how the reasoning graph is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="node-size">Node Size: {nodeSize[0]}%</Label>
            <Slider
              id="node-size"
              min={50}
              max={150}
              step={10}
              value={nodeSize}
              onValueChange={setNodeSize}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edge-thickness">Edge Thickness: {edgeThickness[0]}px</Label>
            <Slider
              id="edge-thickness"
              min={1}
              max={5}
              step={1}
              value={edgeThickness}
              onValueChange={setEdgeThickness}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Graph Layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force-directed">Force-Directed</SelectItem>
                <SelectItem value="layered">Layered (Hierarchical)</SelectItem>
                <SelectItem value="compact">Compact Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Options to improve visibility and usability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="colorblind">Colorblind Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use patterns in addition to colors for node types
              </p>
            </div>
            <Switch
              id="colorblind"
              checked={colorblindMode}
              onCheckedChange={setColorblindMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Visual appearance preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Current Theme</Label>
              <p className="text-sm text-muted-foreground">
                Neon Dark (Default)
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-secondary">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
          Save Settings
        </Button>
      </div>
    </div>
  )
}
