'use client'

import { useState } from 'react'
import { Settings, Clock, Palette, Volume2, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useSettingsStore } from '@/store'
import { UserSettings } from '@/types'

const ACCENT_COLORS = [
  { name: 'Tomato', value: '#FF6347' },
  { name: 'Ocean', value: '#0ea5e9' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
]

const ALARM_SOUNDS = [
  { name: 'Bell', value: 'bell' },
  { name: 'Chime', value: 'chime' },
  { name: 'Digital', value: 'digital' },
  { name: 'Gentle', value: 'gentle' },
]

const BACKGROUND_SOUNDS = [
  { name: 'None', value: 'none' },
  { name: 'Rain', value: 'rain' },
  { name: 'Forest', value: 'forest' },
  { name: 'Cafe', value: 'cafe' },
  { name: 'Ocean', value: 'ocean' },
]

export const SettingsDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    setIsOpen(false)
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      resetSettings()
      setLocalSettings(settings)
    }
  }

  const updateTimerSettings = (field: keyof typeof localSettings.timer, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      timer: { ...prev.timer, [field]: value }
    }))
  }

  const updateAppearanceSettings = (field: keyof typeof localSettings.appearance, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value }
    }))
  }

  const updateSoundSettings = (field: keyof typeof localSettings.sound, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      sound: { ...prev.sound, [field]: value }
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Timer Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pomodoro-time">Pomodoro (minutes)</Label>
                <Input
                  id="pomodoro-time"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.timer.pomodoroTime}
                  onChange={(e) => updateTimerSettings('pomodoroTime', parseInt(e.target.value) || 25)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.timer.shortBreakTime}
                  onChange={(e) => updateTimerSettings('shortBreakTime', parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.timer.longBreakTime}
                  onChange={(e) => updateTimerSettings('longBreakTime', parseInt(e.target.value) || 15)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="long-break-interval">Long Break Interval</Label>
                <Input
                  id="long-break-interval"
                  type="number"
                  min="2"
                  max="10"
                  value={localSettings.timer.longBreakInterval}
                  onChange={(e) => updateTimerSettings('longBreakInterval', parseInt(e.target.value) || 4)}
                  className="w-24"
                />
                <p className="text-xs text-muted-foreground">
                  Number of pomodoros before a long break
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-breaks">Auto-start breaks</Label>
                <Switch
                  id="auto-start-breaks"
                  checked={localSettings.timer.autoStartBreaks}
                  onCheckedChange={(checked) => updateTimerSettings('autoStartBreaks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-pomodoros">Auto-start pomodoros</Label>
                <Switch
                  id="auto-start-pomodoros"
                  checked={localSettings.timer.autoStartPomodoros}
                  onCheckedChange={(checked) => updateTimerSettings('autoStartPomodoros', checked)}
                />
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={localSettings.appearance.theme === 'dark'}
                onCheckedChange={(checked) => updateAppearanceSettings('theme', checked ? 'dark' : 'light')}
              />
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      localSettings.appearance.accentColor === color.value
                        ? 'border-foreground scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => updateAppearanceSettings('accentColor', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Sound</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alarm-sound">Alarm Sound</Label>
                <select
                  id="alarm-sound"
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={localSettings.sound.alarmSound}
                  onChange={(e) => updateSoundSettings('alarmSound', e.target.value)}
                >
                  {ALARM_SOUNDS.map((sound) => (
                    <option key={sound.value} value={sound.value}>
                      {sound.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background-sound">Background Sound</Label>
                <select
                  id="background-sound"
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={localSettings.sound.backgroundSound}
                  onChange={(e) => updateSoundSettings('backgroundSound', e.target.value)}
                >
                  {BACKGROUND_SOUNDS.map((sound) => (
                    <option key={sound.value} value={sound.value}>
                      {sound.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alarm Volume: {Math.round(localSettings.sound.alarmVolume * 100)}%</Label>
                <Slider
                  value={[localSettings.sound.alarmVolume]}
                  onValueChange={([value]) => updateSoundSettings('alarmVolume', value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Background Volume: {Math.round(localSettings.sound.backgroundVolume * 100)}%</Label>
                <Slider
                  value={[localSettings.sound.backgroundVolume]}
                  onValueChange={([value]) => updateSoundSettings('backgroundVolume', value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}