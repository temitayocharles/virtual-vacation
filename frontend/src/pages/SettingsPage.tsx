import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  LogOut,
  ChevronRight,
  Zap,
  Accessibility,
  RefreshCw,
  Download,
  Trash2,
  Info
} from 'lucide-react'
import { designSystem } from '../config/designSystem'
import InteractiveButton from '../components/UI/InteractiveButton'

interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  audioEnabled: boolean
  notificationsEnabled: boolean
  qualitySetting: 'low' | 'medium' | 'high' | 'ultra'
  autoplay: boolean
  saveHistory: boolean
  dataCollection: boolean
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'privacy' | 'account' | 'about'>('general')
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'en',
    audioEnabled: true,
    notificationsEnabled: true,
    qualitySetting: 'high',
    autoplay: true,
    saveHistory: true,
    dataCollection: false
  })
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings({ ...settings, [key]: value })
    setHasChanges(true)
  }

  const handleSave = () => {
    alert('Settings saved successfully!')
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings({
      theme: 'light',
      language: 'en',
      audioEnabled: true,
      notificationsEnabled: true,
      qualitySetting: 'high',
      autoplay: true,
      saveHistory: true,
      dataCollection: false
    })
    setHasChanges(true)
  }

  const settingTabs = ['general', 'audio', 'privacy', 'account', 'about'] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className={`${designSystem.layout.sectionWithPadding} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center mb-6">
            <Settings className="text-purple-600 mr-3" size={40} />
            <h1 className={`${designSystem.typography.h1Large} text-gradient`}>
              Settings
            </h1>
          </div>
          <p className={`${designSystem.typography.subtitle} max-w-2xl`}>
            Customize your Virtual Vacation experience to your preferences
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className={`${designSystem.layout.sectionWithPadding}`}>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="travel-card p-4 h-fit">
              <nav className="space-y-2">
                {settingTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-colors flex items-center justify-between ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="capitalize">{tab}</span>
                    {activeTab === tab && <ChevronRight size={18} />}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {/* General Settings */}
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className={designSystem.typography.h2 + ' mb-8'}>General Settings</h2>

                  {/* Theme */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Sun className="text-yellow-500 mr-3" size={24} />
                          Theme
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Choose your preferred color scheme</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <label
                          key={theme}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            settings.theme === theme
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={settings.theme === theme}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                            className="mr-2"
                          />
                          <span className="font-medium text-gray-900 capitalize">
                            {theme === 'auto' ? 'System' : theme}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Globe className="text-blue-600 mr-3" size={24} />
                          Language
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Select your preferred language</p>
                      </div>
                    </div>

                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="es">Español</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  {/* Quality */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Zap className="text-yellow-500 mr-3" size={24} />
                          Display Quality
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Adjust 360° view resolution</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                        <label
                          key={quality}
                          className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <input
                            type="radio"
                            name="quality"
                            value={quality}
                            checked={settings.qualitySetting === quality}
                            onChange={(e) => handleSettingChange('qualitySetting', e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 capitalize">{quality}</span>
                            <span className="text-xs text-gray-600 ml-2">
                              {quality === 'low' && '480p - Low bandwidth'}
                              {quality === 'medium' && '720p - Balanced'}
                              {quality === 'high' && '1440p - High quality'}
                              {quality === 'ultra' && '4K - Maximum quality'}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Autoplay */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <RefreshCw className="text-green-600 mr-3" size={24} />
                          Autoplay
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Auto-play videos and animations</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('autoplay', !settings.autoplay)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.autoplay ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.autoplay ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Audio Settings */}
              {activeTab === 'audio' && (
                <motion.div
                  key="audio"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className={designSystem.typography.h2 + ' mb-8'}>Audio Settings</h2>

                  {/* Audio Enabled */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Volume2 className="text-green-600 mr-3" size={24} />
                          Audio
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Enable immersive audio experience</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('audioEnabled', !settings.audioEnabled)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.audioEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.audioEnabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Volume Control */}
                  {settings.audioEnabled && (
                    <div className="travel-card p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Master Volume</h3>
                      <div className="flex items-center gap-4">
                        <VolumeX size={20} className="text-gray-600" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="80"
                          className="flex-1"
                        />
                        <Volume2 size={20} className="text-gray-600" />
                      </div>
                    </div>
                  )}

                  {/* Ambient Sound */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Ambient Sound Effects</h3>
                        <p className="text-sm text-gray-600 mt-1">Include background ambience in locations</p>
                      </div>
                      <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-7" />
                      </button>
                    </div>
                  </div>

                  {/* Spatial Audio */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Spatial Audio (3D Sound)</h3>
                        <p className="text-sm text-gray-600 mt-1">Use surround sound for immersion</p>
                      </div>
                      <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 transition-colors">
                        <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className={designSystem.typography.h2 + ' mb-8'}>Privacy & Data</h2>

                  {/* Save History */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Eye className="text-purple-600 mr-3" size={24} />
                          Save Browsing History
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Remember your exploration journey</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('saveHistory', !settings.saveHistory)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.saveHistory ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.saveHistory ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Data Collection */}
                  <div className="travel-card p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Lock className="text-red-600 mr-3" size={24} />
                          Allow Analytics
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Help us improve by sharing usage data</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('dataCollection', !settings.dataCollection)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.dataCollection ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.dataCollection ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy & Security</h3>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Privacy Policy</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Terms of Service</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Cookie Settings</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Data Management</h3>
                    <div className="space-y-3">
                      <InteractiveButton
                        variant="ghost"
                        size="md"
                        icon={Download}
                        className="w-full justify-start"
                      >
                        Download My Data
                      </InteractiveButton>
                      <button className="w-full flex items-center justify-start px-4 py-3 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors">
                        <Trash2 size={18} className="mr-3 text-red-600" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className={designSystem.typography.h2 + ' mb-8'}>Account</h2>

                  {/* Profile Info */}
                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <User className="text-blue-600 mr-3" size={24} />
                      Profile Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" defaultValue="John Doe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" defaultValue="john@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Subscription */}
                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Subscription</h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Premium Plan</div>
                          <div className="text-sm text-gray-600">Renews on December 15, 2025</div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">$9.99/mo</span>
                      </div>
                    </div>
                    <InteractiveButton variant="ghost" size="md">Manage Subscription</InteractiveButton>
                  </div>

                  {/* Sessions */}
                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="p-4 border border-gray-300 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">macOS - Chrome</div>
                          <div className="text-sm text-gray-600">Last active: 2 hours ago</div>
                        </div>
                        <span className="text-sm font-medium text-green-600">Current</span>
                      </div>
                    </div>
                    <InteractiveButton variant="ghost" size="md" className="w-full mt-4">
                      Logout All Devices
                    </InteractiveButton>
                  </div>

                  {/* Danger Zone */}
                  <div className="travel-card p-8 border-2 border-red-300 bg-red-50">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-6">These actions cannot be undone.</p>
                    <InteractiveButton
                      variant="ghost"
                      size="md"
                      icon={LogOut}
                      className="w-full text-red-600 border-red-300 hover:bg-red-100"
                    >
                      Logout
                    </InteractiveButton>
                  </div>
                </motion.div>
              )}

              {/* About */}
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className={designSystem.typography.h2 + ' mb-8'}>About</h2>

                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Info className="text-blue-600 mr-3" size={24} />
                      App Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Version</span>
                        <span className="font-semibold text-gray-900">2.5.1</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Build</span>
                        <span className="font-semibold text-gray-900">2025.11.02</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Environment</span>
                        <span className="font-semibold text-gray-900">Production</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-semibold text-gray-900">Nov 2, 2025</span>
                      </div>
                    </div>
                  </div>

                  <div className="travel-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Resources</h3>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Documentation</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Support Center</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Report a Bug</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-700">Feature Request</span>
                        <ChevronRight size={20} className="text-gray-400" />
                      </a>
                    </div>
                  </div>

                  <div className="travel-card p-8 text-center">
                    <p className="text-sm text-gray-600 mb-2">Made with ❤️ by Virtual Vacation Team</p>
                    <p className="text-xs text-gray-500">© 2025 Virtual Vacation. All rights reserved.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Action Buttons */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg"
        >
          <div className={`${designSystem.layout.containerMaxWidth} mx-auto flex justify-end gap-4`}>
            <InteractiveButton
              variant="ghost"
              size="lg"
              icon={RotateCcw}
              onClick={handleReset}
            >
              Reset
            </InteractiveButton>
            <InteractiveButton
              variant="primary"
              size="lg"
              icon={Save}
              onClick={handleSave}
            >
              Save Changes
            </InteractiveButton>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SettingsPage
