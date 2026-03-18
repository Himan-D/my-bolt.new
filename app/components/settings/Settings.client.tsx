import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { db, getSettings, saveSettings, type UserSettings } from '~/lib/persistence';
import { providersStore, selectedProviderStore, selectedModelStore, type ProviderInfo } from '~/lib/stores/providers';
import { cloudStore } from '~/lib/stores/cloud';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export function Settings({ open, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'providers' | 'model' | 'cloud'>('providers');
  const [providers, setProviders] = useState<ProviderInfo[]>(providersStore.get());
  const [selectedProvider, setSelectedProvider] = useState(selectedProviderStore.get());
  const [selectedModel, setSelectedModel] = useState(selectedModelStore.get());
  const [cloud, setCloud] = useState(cloudStore.get());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && db) {
      getSettings(db)
        .then((settings) => {
          if (settings.providers) {
            // merge saved settings with default provider model lists
            const defaults = providersStore.get();
            const merged = defaults.map((def) => {
              const saved = settings.providers.find((p) => p.name === def.name);
              return saved
                ? { ...def, apiKey: saved.apiKey ?? '', enabled: saved.enabled ?? def.enabled }
                : def;
            });
            setProviders(merged);
          }

          if (settings.selectedProvider) {
            setSelectedProvider(settings.selectedProvider);
          }

          if (settings.selectedModel) {
            setSelectedModel(settings.selectedModel);
          }

          if (settings.cloud) {
            setCloud(settings.cloud);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleSave = async () => {
    if (!db) {
      return;
    }

    setIsSaving(true);

    try {
      const settings: UserSettings = {
        providers: providers.map((p) => ({ name: p.name, apiKey: p.apiKey, enabled: p.enabled })),
        selectedProvider,
        selectedModel,
        cloud,
      };

      await saveSettings(db, settings);

      // update stores
      providersStore.set(providers);
      selectedProviderStore.set(selectedProvider);
      selectedModelStore.set(selectedModel);
      cloudStore.set(cloud);

      toast.success('Settings saved');
      onClose();
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProviderKey = (name: string, apiKey: string) => {
    setProviders((prev) => prev.map((p) => (p.name === name ? { ...p, apiKey } : p)));
  };

  const toggleProvider = (name: string) => {
    setProviders((prev) => prev.map((p) => (p.name === name ? { ...p, enabled: !p.enabled } : p)));
  };

  const currentProvider = providers.find((p) => p.name === selectedProvider);
  const availableModels = currentProvider?.models || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-bolt-elements-borderColor">
                <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Settings</h2>
                <button
                  onClick={onClose}
                  className="text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-colors"
                >
                  <div className="i-ph:x text-xl" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-bolt-elements-borderColor">
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'providers'
                      ? 'text-bolt-elements-textPrimary border-b-2 border-bolt-elements-textPrimary'
                      : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary'
                  }`}
                >
                  Providers
                </button>
                <button
                  onClick={() => setActiveTab('model')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'model'
                      ? 'text-bolt-elements-textPrimary border-b-2 border-bolt-elements-textPrimary'
                      : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary'
                  }`}
                >
                  Model
                </button>
                <button
                  onClick={() => setActiveTab('cloud')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'cloud'
                      ? 'text-bolt-elements-textPrimary border-b-2 border-bolt-elements-textPrimary'
                      : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary'
                  }`}
                >
                  Cloud
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'providers' && (
                  <div className="space-y-4">
                    {providers.map((provider) => (
                      <div
                        key={provider.name}
                        className="p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-bolt-elements-textPrimary">{provider.name}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={provider.enabled}
                              onChange={() => toggleProvider(provider.name)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-bolt-elements-borderColor rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                          </label>
                        </div>
                        <input
                          type="password"
                          placeholder={`${provider.name} API Key`}
                          value={provider.apiKey}
                          onChange={(e) => updateProviderKey(provider.name, e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary text-sm placeholder-bolt-elements-textTertiary focus:outline-none focus:border-bolt-elements-textPrimary transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'model' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-2">
                        Provider
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          setSelectedProvider(e.target.value);
                          const prov = providers.find((p) => p.name === e.target.value);

                          if (prov && prov.models.length > 0) {
                            setSelectedModel(prov.models[0].id);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary text-sm focus:outline-none focus:border-bolt-elements-textPrimary"
                      >
                        {providers
                          .filter((p) => p.enabled)
                          .map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-2">Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary text-sm focus:outline-none focus:border-bolt-elements-textPrimary"
                      >
                        {availableModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3 rounded-md bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor">
                      <p className="text-xs text-bolt-elements-textTertiary">
                        Current: <span className="text-bolt-elements-textPrimary font-medium">{selectedProvider}</span>{' '}
                        / <span className="text-bolt-elements-textPrimary font-medium">{selectedModel}</span>
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'cloud' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
                      <h3 className="font-medium text-bolt-elements-textPrimary mb-3">Supabase (Database & Auth)</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Supabase URL"
                          value={cloud.supabaseUrl}
                          onChange={(e) => setCloud({ ...cloud, supabaseUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary text-sm placeholder-bolt-elements-textTertiary focus:outline-none focus:border-bolt-elements-textPrimary transition-colors"
                        />
                        <input
                          type="password"
                          placeholder="Supabase Anon Key"
                          value={cloud.supabaseAnonKey}
                          onChange={(e) => setCloud({ ...cloud, supabaseAnonKey: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary text-sm placeholder-bolt-elements-textTertiary focus:outline-none focus:border-bolt-elements-textPrimary transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
                      <h3 className="font-medium text-bolt-elements-textPrimary mb-3">Netlify (Deployment)</h3>
                      <input
                        type="password"
                        placeholder="Netlify Personal Access Token"
                        value={cloud.netlifyToken}
                        onChange={(e) => setCloud({ ...cloud, netlifyToken: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary text-sm placeholder-bolt-elements-textTertiary focus:outline-none focus:border-bolt-elements-textPrimary transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-bolt-elements-borderColor">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-lg text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm rounded-lg bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
