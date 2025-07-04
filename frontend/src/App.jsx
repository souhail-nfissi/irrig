import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sprout, 
  User, 
  Lock, 
  Mail, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Cloud, 
  Droplets,
  MapPin,
  TrendingUp,
  Thermometer,
  Eye,
  EyeOff,
  LogOut,
  Home,
  Settings
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// API Service
class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    return this.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
  }

  async register(userData) {
    return this.request('/users/', {
      method: 'POST',
      body: userData,
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  // Crop endpoints
  async getCrops() {
    return this.request('/crops/');
  }

  async getCrop(cropName) {
    return this.request(`/crops/${cropName}`);
  }

  async createCrop(cropData) {
    return this.request('/crops/', {
      method: 'POST',
      body: cropData,
    });
  }

  async updateCrop(cropName, updateData) {
    return this.request(`/crops/${cropName}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  async deleteCrop(cropName) {
    return this.request(`/crops/${cropName}`, {
      method: 'DELETE',
    });
  }

  async resetCrops() {
    return this.request('/crops/reset', {
      method: 'POST',
    });
  }

  // Climate endpoints
  async getClimate(lat, lon) {
    return this.request(`/climate/?lat=${lat}&lon=${lon}`);
  }

  // Irrigation calculation endpoints
  async calculateNRn(data) {
    const params = new URLSearchParams(data);
    return this.request(`/irrigation/calculateNRn?${params}`);
  }

  async calculateEa(data) {
    const params = new URLSearchParams(data);
    return this.request(`/irrigation/calculateEa?${params}`);
  }

  async calculateNRt(data) {
    const params = new URLSearchParams(data);
    return this.request(`/irrigation/calculateNRt?${params}`);
  }

  async calculateDn(data) {
    const params = new URLSearchParams(data);
    return this.request(`/irrigation/calculateDn?${params}`);
  }

  async calculateI(data) {
    const params = new URLSearchParams(data);
    return this.request(`/irrigation/calculateI?${params}`);
  }
}

const api = new ApiService();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        api.setToken(null);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.access_token);
      api.setToken(response.access_token);
      const userData = await api.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      await api.register(userData);
      return await handleLogin(userData.email, userData.password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar 
        user={user} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
      />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'crops' && <CropsPage />}
        {currentPage === 'calculator' && <CalculatorPage />}
        {currentPage === 'climate' && <ClimatePage />}
      </main>
    </div>
  );
};

const AuthScreen = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin 
        ? await onLogin(formData.email, formData.password)
        : await onRegister({
            email: formData.email,
            password: formData.password,
            name: formData.name
          });

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            IrrigSmart
          </h1>
          <p className="text-gray-600 mt-2">Smart Irrigation Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', name: '' });
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, currentPage, setCurrentPage, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'crops', label: 'Crops', icon: Sprout },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'climate', label: 'Climate', icon: Cloud },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              IrrigSmart
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}

            <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
              <div className="text-sm">
                <p className="text-gray-700 font-medium">Welcome, {user.email.split('@')[0]}</p>
                <p className="text-gray-500 text-xs">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCalculations: 0,
    lastClimateUpdate: null
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const crops = await api.getCrops();
      setStats(prev => ({
        ...prev,
        totalCrops: Object.keys(crops).length
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to IrrigSmart Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Manage your irrigation needs with precision and efficiency
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Crops</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalCrops}</p>
            </div>
            <Sprout className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Calculations</p>
              <p className="text-3xl font-bold text-gray-800">{stats.activeCalculations}</p>
            </div>
            <Calculator className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Climate Data</p>
              <p className="text-sm font-medium text-gray-800">
                {stats.lastClimateUpdate ? 'Updated' : 'Not available'}
              </p>
            </div>
            <Cloud className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3">
              <Calculator className="w-5 h-5 text-green-600" />
              <span>Calculate Irrigation Requirements</span>
            </button>
            <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3">
              <Sprout className="w-5 h-5 text-blue-600" />
              <span>Manage Crop Database</span>
            </button>
            <button className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-3">
              <Cloud className="w-5 h-5 text-purple-600" />
              <span>Check Climate Data</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Features</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time climate data integration</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Crop-specific irrigation calculations</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Soil texture analysis</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Water efficiency optimization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const CropsPage = () => {
  const [crops, setCrops] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    Kc: '',
    CEemax: '',
    H: '',
    f: ''
  });

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const cropsData = await api.getCrops();
      setCrops(cropsData);
    } catch (error) {
      console.error('Failed to load crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await api.updateCrop(editingCrop, {
          Kc: parseFloat(formData.Kc),
          CEemax: parseFloat(formData.CEemax),
          H: parseInt(formData.H),
          f: parseFloat(formData.f)
        });
      } else {
        await api.createCrop({
          name: formData.name,
          Kc: parseFloat(formData.Kc),
          CEemax: parseFloat(formData.CEemax),
          H: parseInt(formData.H),
          f: parseFloat(formData.f)
        });
      }
      
      await loadCrops();
      resetForm();
    } catch (error) {
      alert('Error saving crop: ' + error.message);
    }
  };

  const handleEdit = (cropName) => {
    const crop = crops[cropName];
    setFormData({
      name: cropName,
      Kc: crop.Kc.toString(),
      CEemax: crop.CEemax.toString(),
      H: crop.H.toString(),
      f: crop.f.toString()
    });
    setEditingCrop(cropName);
  };

  const handleDelete = async (cropName) => {
    if (window.confirm(`Are you sure you want to delete ${cropName}?`)) {
      try {
        await api.deleteCrop(cropName);
        await loadCrops();
      } catch (error) {
        alert('Error deleting crop: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', Kc: '', CEemax: '', H: '', f: '' });
    setEditingCrop(null);
    setShowAddForm(false);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('This will reset all crops to default values. Continue?')) {
      try {
        await api.resetCrops();
        await loadCrops();
        alert('Crops reset to defaults successfully');
      } catch (error) {
        alert('Error resetting crops: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Sprout className="w-8 h-8 text-green-500 mr-3" />
              Crop Management
            </h2>
            <p className="text-gray-600 mt-2">Manage your crop parameters for irrigation calculations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Crop</span>
            </button>
            <button
              onClick={handleResetToDefaults}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {(showAddForm || editingCrop) && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold mb-4">
              {editingCrop ? 'Edit Crop' : 'Add New Crop'}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., Tomato"
                  disabled={!!editingCrop}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kc (Crop Coefficient)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.Kc}
                  onChange={(e) => setFormData(prev => ({ ...prev, Kc: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., 1.15"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEemax (dS/m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.CEemax}
                  onChange={(e) => setFormData(prev => ({ ...prev, CEemax: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., 12.51"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">H (Root Depth, cm)</label>
                <input
                  type="number"
                  value={formData.H}
                  onChange={(e) => setFormData(prev => ({ ...prev, H: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., 110"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">f (Depletion Factor)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.f}
                  onChange={(e) => setFormData(prev => ({ ...prev, f: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., 0.4"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingCrop ? 'Update' : 'Add'} Crop</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {Object.entries(crops).map(([cropName, crop]) => (
            <div key={cropName} className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{cropName}</h3>
                  <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Kc:</span> {crop.Kc}
                    </div>
                    <div>
                      <span className="font-semibold">CEemax:</span> {crop.CEemax} dS/m
                    </div>
                    <div>
                      <span className="font-semibold">Root Depth:</span> {crop.H} cm
                    </div>
                    <div>
                      <span className="font-semibold">Depletion Factor:</span> {crop.f}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(cropName)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit crop"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cropName)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete crop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(crops).length === 0 && (
          <div className="text-center py-12">
            <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No crops available</p>
            <p className="text-gray-400">Add crops or reset to defaults to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CalculatorPage = () => {
  const [calculationType, setCalculationType] = useState('NRn');
  const [crops, setCrops] = useState({});
  const [formData, setFormData] = useState({
    crop_name: '',
    lat: '',
    lon: '',
    CEa: '',
    EL: '',
    texture: 'MEDIUM',
    CU: '',
    Cc: '',
    Pm: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const cropsData = await api.getCrops();
      setCrops(cropsData);
      if (Object.keys(cropsData).length > 0) {
        setFormData(prev => ({ ...prev, crop_name: Object.keys(cropsData)[0] }));
      }
    } catch (error) {
      console.error('Failed to load crops:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lon: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          alert('Failed to get current location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      let result;
      switch (calculationType) {
        case 'NRn':
          result = await api.calculateNRn({
            crop_name: formData.crop_name,
            lat: formData.lat,
            lon: formData.lon
          });
          break;
        case 'Ea':
          result = await api.calculateEa({
            crop_name: formData.crop_name,
            lat: formData.lat,
            lon: formData.lon,
            CEa: formData.CEa,
            EL: formData.EL,
            texture: formData.texture,
            CU: formData.CU
          });
          break;
        case 'NRt':
          result = await api.calculateNRt({
            crop_name: formData.crop_name,
            lat: formData.lat,
            lon: formData.lon,
            CU: formData.CU,
            texture: formData.texture,
            EL: formData.EL,
            CEa: formData.CEa
          });
          break;
        case 'Dn':
          result = await api.calculateDn({
            crop_name: formData.crop_name,
            texture: formData.texture
          });
          break;
        case 'I':
          result = await api.calculateI({
            crop_name: formData.crop_name,
            texture: formData.texture,
            lat: formData.lat,
            lon: formData.lon
          });
          break;
        default:
          throw new Error('Invalid calculation type');
      }
      setResults({ type: calculationType, data: result });
    } catch (error) {
      alert('Calculation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculationTypes = [
    { value: 'NRn', label: 'Net Water Requirements (NRn)', description: 'Calculate crop water needs minus effective precipitation' },
    { value: 'Ea', label: 'Irrigation Efficiency (Ea)', description: 'Calculate irrigation application efficiency' },
    { value: 'NRt', label: 'Total Water Requirements (NRt)', description: 'Calculate total irrigation water requirements' },
    { value: 'Dn', label: 'Net Irrigation Dose (Dn)', description: 'Calculate irrigation dose per application' },
    { value: 'I', label: 'Irrigation Frequency (I)', description: 'Calculate irrigation application frequency' }
  ];

  const textureOptions = [
    { value: 'COARSE', label: 'Coarse (Sandy)' },
    { value: 'MEDIUM', label: 'Medium (Loam)' },
    { value: 'FINE', label: 'Fine (Silty Clay)' },
    { value: 'HEAVY', label: 'Heavy (Clay)' }
  ];

  const renderFormFields = () => {
    const commonFields = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
          <select
            value={formData.crop_name}
            onChange={(e) => setFormData(prev => ({ ...prev, crop_name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a crop</option>
            {Object.keys(crops).map(cropName => (
              <option key={cropName} value={cropName}>{cropName}</option>
            ))}
          </select>
        </div>
      </>
    );

    const locationFields = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={formData.lat}
            onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="e.g., 34.0522"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={formData.lon}
            onChange={(e) => setFormData(prev => ({ ...prev, lon: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="e.g., -6.8331"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 border border-gray-200"
          >
            <MapPin className="w-4 h-4" />
            <span>Use Current Location</span>
          </button>
        </div>
      </>
    );

    const textureField = (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Texture</label>
        <select
          value={formData.texture}
          onChange={(e) => setFormData(prev => ({ ...prev, texture: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          required
        >
          {textureOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    );

    const irrigationFields = (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEa (dS/m)</label>
          <input
            type="number"
            step="0.01"
            value={formData.CEa}
            onChange={(e) => setFormData(prev => ({ ...prev, CEa: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="Electrical conductivity of irrigation water"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">EL (Leaching Efficiency)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={formData.EL}
            onChange={(e) => setFormData(prev => ({ ...prev, EL: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="0.0 to 1.0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CU (Uniformity Coefficient)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={formData.CU}
            onChange={(e) => setFormData(prev => ({ ...prev, CU: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="0.0 to 1.0"
            required
          />
        </div>
      </>
    );

    switch (calculationType) {
      case 'NRn':
        return (
          <div className="grid md:grid-cols-3 gap-4">
            {commonFields}
            {locationFields}
          </div>
        );
      case 'Ea':
        return (
          <div className="grid md:grid-cols-3 gap-4">
            {commonFields}
            {locationFields}
            {textureField}
            {irrigationFields}
          </div>
        );
      case 'NRt':
        return (
          <div className="grid md:grid-cols-3 gap-4">
            {commonFields}
            {locationFields}
            {textureField}
            {irrigationFields}
          </div>
        );
      case 'Dn':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {commonFields}
            {textureField}
          </div>
        );
      case 'I':
        return (
          <div className="grid md:grid-cols-3 gap-4">
            {commonFields}
            {locationFields}
            {textureField}
          </div>
        );
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const { type, data } = results;

    const resultCards = [];

    switch (type) {
      case 'NRn':
        resultCards.push(
          <div key="nrn" className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Net Water Requirements</p>
            <p className="text-2xl font-bold text-blue-600">{data.NRn.toFixed(2)} mm</p>
          </div>,
          <div key="etc" className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Crop Evapotranspiration</p>
            <p className="text-2xl font-bold text-green-600">{data.ETc.toFixed(2)} mm</p>
          </div>,
          <div key="pe" className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Effective Precipitation</p>
            <p className="text-2xl font-bold text-purple-600">{data.Pe.toFixed(2)} mm</p>
          </div>
        );
        break;
      case 'Ea':
        resultCards.push(
          <div key="ea" className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Irrigation Efficiency</p>
            <p className="text-2xl font-bold text-blue-600">{(data.Ea * 100).toFixed(1)}%</p>
          </div>,
          <div key="rt" className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Transpiration Ratio</p>
            <p className="text-2xl font-bold text-green-600">{(data.Rt * 100).toFixed(1)}%</p>
          </div>,
          <div key="fl" className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Leaching Fraction</p>
            <p className="text-2xl font-bold text-purple-600">{(data.FL * 100).toFixed(1)}%</p>
          </div>,
          <div key="rl" className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-600">Leaching Ratio</p>
            <p className="text-2xl font-bold text-orange-600">{data.RL.toFixed(3)}</p>
          </div>
        );
        break;
      case 'NRt':
        resultCards.push(
          <div key="nrt" className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Water Requirements</p>
            <p className="text-2xl font-bold text-blue-600">{data.NRt.toFixed(2)} mm</p>
          </div>,
          <div key="nrn" className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Net Water Requirements</p>
            <p className="text-2xl font-bold text-green-600">{data.NRn.toFixed(2)} mm</p>
          </div>,
          <div key="ea" className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Irrigation Efficiency</p>
            <p className="text-2xl font-bold text-purple-600">{(data.Ea * 100).toFixed(1)}%</p>
          </div>
        );
        break;
      case 'Dn':
        resultCards.push(
          <div key="dn" className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Net Irrigation Dose</p>
            <p className="text-2xl font-bold text-blue-600">{data.Dn.toFixed(2)} mm</p>
          </div>
        );
        break;
      case 'I':
        resultCards.push(
          <div key="i" className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Irrigation Frequency</p>
            <p className="text-2xl font-bold text-blue-600">{data.I.toFixed(1)} days</p>
          </div>
        );
        break;
    }

    return (
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Calculation Results</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resultCards}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Calculator className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Irrigation Calculator</h2>
          <p className="text-gray-600 mt-2">Calculate irrigation parameters for your crops</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Calculation Type</label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {calculationTypes.map((calc) => (
              <button
                key={calc.value}
                onClick={() => setCalculationType(calc.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  calculationType === calc.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-semibold">{calc.label}</div>
                <div className="text-xs text-gray-500 mt-1">{calc.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {renderFormFields()}

          <div className="flex justify-center">
            <button
              onClick={handleCalculate}
              disabled={loading || !formData.crop_name}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Calculate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {renderResults()}
      </div>
    </div>
  );
};

const ClimatePage = () => {
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [climateData, setClimateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetClimate = async () => {
    if (!location.lat || !location.lon) {
      setError('Please enter both latitude and longitude');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await api.getClimate(location.lat, location.lon);
      setClimateData(data);
    } catch (err) {
      setError('Failed to fetch climate data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(6),
            lon: position.coords.longitude.toFixed(6)
          });
        },
        (error) => {
          setError('Failed to get current location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Cloud className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Climate Data</h2>
          <p className="text-gray-600 mt-2">Get real-time weather and climate information</p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={location.lat}
                onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., 34.0522"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={location.lon}
                onChange={(e) => setLocation(prev => ({ ...prev, lon: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., -6.8331"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleUseCurrentLocation}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="w-5 h-5" />
              <span>Use Current Location</span>
            </button>
            <button
              onClick={handleGetClimate}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  <span>Get Climate Data</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {climateData && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Climate Information</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Temperature</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{climateData.temperature}°C</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Droplets className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Humidity</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{climateData.humidity}%</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Cloud className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600">Precipitation</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{climateData.precipitation} mm</p>
              </div>
              
              {climateData.ET0 && (
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">ET0</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{climateData.ET0} mm</p>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Cloud className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm text-gray-600">Climate Type</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">{climateData.climate}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-gray-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Date</span>
                </div>
                <p className="text-lg font-bold text-gray-600">{climateData.date}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Location Information</h4>
              <p className="text-gray-600">Latitude: {location.lat}°</p>
              <p className="text-gray-600">Longitude: {location.lon}°</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Calendar icon for date display
const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default App;
