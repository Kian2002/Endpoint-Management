export default function Home() {
  const alerts = [
    {
      type: "Alert",
      title: "High CPU usage on Endpoint X",
    },
    {
      type: "Information",
      title: "Update available for Endpoint Y",
    },
    {
      type: "Critical Alert",
      title: "Unauthorized access attempt detected",
    },
  ];

  const keyFeatures = [
    "Real-Time Monitoring",
    "Endpoint Security",
    "Automated Detection",
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <div className="font-bold">Logo</div>
        <nav className="flex items-center gap-6">
          <a href="#">Dashboard</a>
          <a href="#">Endpoints</a>
          <a href="#">Alerts</a>
          <a href="#">Login</a>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8"
        id="dashboard"
      >
        <div>
          <h1 className="text-2xl font-semibold mb-4">
            Realtime Endpoint Management
          </h1>
          <p className="mb-4 text-sm text-gray-600">
            Lorem ipsum dolor sit amet et delectus accommodare his consul
            copiosae...
          </p>
          <div className="flex gap-2">
            <button className="bg-black text-white px-4 py-2 rounded cursor-pointer">
              Signup
            </button>
            <button className="border px-4 py-2 rounded cursor-pointer">
              Login
            </button>
          </div>
        </div>
        <div className="bg-gray-200 rounded-lg h-40 md:h-60 flex justify-center items-center">
          <span>Image Placeholder</span>
        </div>
      </section>

      {/* Key Features */}
      <section className="p-8" id="endpoints">
        <h2 className="font-semibold mb-2">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-40 flex justify-center items-center">
            Image Placeholder
          </div>
          <div className="space-y-4">
            {keyFeatures.map((title, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="bg-gray-300 p-2 rounded-full">O</div>
                <div>
                  <h4 className="font-semibold">{title}</h4>
                  <p className="text-sm text-gray-600">
                    Lorem ipsum dolor sit amet et delectus accommodare...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts & Activity Feed */}
      <section className="p-8" id="alerts">
        <h2 className="text-xl font-semibold text-center">
          Recent Alerts & Activity Feed
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Lorem ipsum dolor sit amet et delectus accommodare...
        </p>
        <div className="flex justify-center gap-2 text-sm mb-6">
          <button className="cursor-pointer bg-black text-white px-4 py-2 rounded">
            View All Alerts
          </button>
          <button className="cursor-pointer px-4 rounded py-2 border">
            View All Activity
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {alerts.map((card, i) => (
            <div key={i} className="border p-4 rounded space-y-2">
              <div className="bg-gray-200 h-24 flex items-center justify-center rounded">
                Image Placeholder
              </div>
              <div className="text-xs text-gray-500">{card.type}</div>
              <h4 className="font-semibold">{card.title}</h4>
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet et delectus accommodare...
              </p>
              <a href="#" className="text-blue-500 text-sm">
                Read more
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Start Your Free Trial Today
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Lorem ipsum dolor sit amet et delectus accommodare his consul
          copiosae...
        </p>
        <button className="bg-black text-white px-6 py-3 rounded cursor-pointer">
          Start Free Trial
        </button>
      </section>

      {/* {Subscription section} */}
      <section className="p-8 bg-gray-100 text-center">
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <p className="mb-6 text-sm text-gray-600">
          Choose the plan that fits your needs.
        </p>
        <div className="flex justify-center gap-6">
          <div className="border p-6 rounded-lg w-64">
            <h3 className="font-semibold mb-2">Monthly Plan</h3>
            <p className="text-lg font-bold mb-4">$9.99/month</p>
            <button className="bg-black text-white px-4 py-2 rounded cursor-pointer">
              Subscribe
            </button>
          </div>
          <div className="border p-6 rounded-lg w-64">
            <h3 className="font-semibold mb-2">Yearly Plan</h3>
            <p className="text-lg font-bold mb-4">$99.99/year</p>
            <button className="bg-black text-white px-4 py-2 rounded cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 border-t text-center text-sm text-gray-500 space-y-4">
        <div className="font-bold">Logo</div>

        <div className="flex justify-center gap-4 text-gray-400">
          <span>© 2025 EP Manager</span>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
