import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <div className="p-6 max-w-xl">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Site Configuration</h2>
          <div>
            <label className="label">Admin WhatsApp Number</label>
            <p className="text-sm text-gray-500 mb-2">
              Set via <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_WHATSAPP_NUMBER</code> environment variable on the web app.
            </p>
            <input
              className="input"
              placeholder="919876543210"
              defaultValue={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}
              readOnly
            />
          </div>
          <div>
            <label className="label">API URL</label>
            <input
              className="input"
              defaultValue={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1'}
              readOnly
            />
          </div>
          <p className="text-xs text-gray-400">
            To change these values, update the environment variables and redeploy.
          </p>
        </div>
      </div>
    </>
  );
}
