export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <div className="max-w-xl space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="font-semibold">Workspace</h2>
          <p className="mt-1 text-sm text-slate-500">
            Basic workspace preferences. These are placeholders — no backend is
            wired up yet.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Workspace name</span>
            <input
              type="text"
              defaultValue="MY-CRM"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Default currency</span>
            <select
              defaultValue="EUR"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Save changes
        </button>
      </div>
    </div>
  )
}
