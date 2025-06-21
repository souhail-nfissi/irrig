import React, { useState, useEffect } from 'react';
import { Calculator, Sprout, User, Lock, Mail, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

// Mock JWT functions (replace with real implementation)
const mockAuth = {
  login: async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password) {
      const token = btoa(JSON.stringify({ email, exp: Date.now() + 3600000 }));
      return { token, user: { email, name: email.split('@')[0] } };
    }
    throw new Error('Invalid credentials');
  },
  register: async (email, password, name) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const token = btoa(JSON.stringify({ email, exp: Date.now() + 3600000 }));
    return { token, user: { email, name } };
  }
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('calculator');
  const [showAuth, setShowAuth] = useState('login');

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage?.getItem('token');
    const userData = localStorage?.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleAuth = async (email, password, name = null) => {
    try {
      const result = name 
        ? await mockAuth.register(email, password, name)
        : await mockAuth.login(email, password);
      
      // Store in memory instead of localStorage
      setIsAuthenticated(true);
      setUser(result.user);
    } catch (error) {
      alert('Authentication failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <AuthScreen showAuth={showAuth} setShowAuth={setShowAuth} onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'calculator' ? <CalculatorPage /> : <CropsPage />}
      </main>
    </div>
  );
};

const AuthScreen = ({ showAuth, setShowAuth, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onAuth(email, password, showAuth === 'register' ? name : null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            AgriCalc Pro
          </h1>
          <p className="text-gray-600 mt-2">Your agricultural management companion</p>
        </div>

        <div className="space-y-6">
          {showAuth === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (showAuth === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {showAuth === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setShowAuth(showAuth === 'login' ? 'register' : 'login')}
              className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              {showAuth === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, currentPage, setCurrentPage, onLogout }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AgriCalc Pro
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'calculator'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span>Calculator</span>
            </button>

            <button
              onClick={() => setCurrentPage('crops')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'crops'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Sprout className="w-5 h-5" />
              <span>Crops</span>
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const CalculatorPage = () => {
  const [area, setArea] = useState('');
  const [seedRate, setSeedRate] = useState('');
  const [costPerKg, setCostPerKg] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const totalSeeds = parseFloat(area) * parseFloat(seedRate);
    const totalCost = totalSeeds * parseFloat(costPerKg);
    setResult({ totalSeeds, totalCost });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Calculator className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Seed Calculator</h2>
          <p className="text-gray-600 mt-2">Calculate seed requirements and costs for your crops</p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Field Area (hectares)
              </label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter area in hectares"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Seed Rate (kg/hectare)
              </label>
              <input
                type="number"
                step="0.1"
                value={seedRate}
                onChange={(e) => setSeedRate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter seed rate"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cost per Kg ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={costPerKg}
              onChange={(e) => setCostPerKg(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter cost per kilogram"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
          >
            Calculate
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Calculation Results</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Seeds Required</p>
                <p className="text-2xl font-bold text-green-600">{result.totalSeeds.toFixed(2)} kg</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-blue-600">${result.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CropsPage = () => {
  const [crops, setCrops] = useState([
    { id: 1, name: 'Wheat', variety: 'Winter Wheat', plantingDate: '2024-03-15', expectedYield: '4.5 tons/ha' },
    { id: 2, name: 'Corn', variety: 'Sweet Corn', plantingDate: '2024-04-20', expectedYield: '8.2 tons/ha' },
  ]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', variety: '', plantingDate: '', expectedYield: '' });

  const handleAdd = () => {
    if (formData.name && formData.variety && formData.plantingDate && formData.expectedYield) {
      setCrops([...crops, { ...formData, id: Date.now() }]);
      setFormData({ name: '', variety: '', plantingDate: '', expectedYield: '' });
      setShowAddForm(false);
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop.id);
    setFormData(crop);
  };

  const handleUpdate = () => {
    setCrops(crops.map(crop => crop.id === editingCrop ? { ...formData, id: editingCrop } : crop));
    setEditingCrop(null);
    setFormData({ name: '', variety: '', plantingDate: '', expectedYield: '' });
  };

  const handleDelete = (id) => {
    setCrops(crops.filter(crop => crop.id !== id));
  };

  const handleCancel = () => {
    setEditingCrop(null);
    setShowAddForm(false);
    setFormData({ name: '', variety: '', plantingDate: '', expectedYield: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Sprout className="w-8 h-8 text-green-500 mr-3" />
              Crop Management
            </h2>
            <p className="text-gray-600 mt-2">Manage your crop varieties and planting schedules</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Crop</span>
          </button>
        </div>

        {(showAddForm || editingCrop) && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold mb-4">
              {editingCrop ? 'Edit Crop' : 'Add New Crop'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Crop Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Variety"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Expected Yield"
                value={formData.expectedYield}
                onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={editingCrop ? handleUpdate : handleAdd}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingCrop ? 'Update' : 'Add'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {crops.map((crop) => (
            <div key={crop.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{crop.name}</h3>
                  <div className="grid md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Variety:</span> {crop.variety}
                    </div>
                    <div>
                      <span className="font-semibold">Planting Date:</span> {crop.plantingDate}
                    </div>
                    <div>
                      <span className="font-semibold">Expected Yield:</span> {crop.expectedYield}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(crop)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(crop.id)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {crops.length === 0 && (
          <div className="text-center py-12">
            <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No crops added yet</p>
            <p className="text-gray-400">Click "Add Crop" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;