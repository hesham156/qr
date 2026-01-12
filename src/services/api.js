import { getAuth } from 'firebase/auth';

const API_URL = 'https://greenyellow-wombat-960712.hostingersite.com/wp-json/digicard/v1';

// دالة مساعدة لجلب Token وإرسال الطلب
const apiFetch = async (endpoint, options = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }

  return response.json();
};

export const api = {
  // Employees
  getEmployees: () => apiFetch('/employees'),
  createEmployee: (data) => apiFetch('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data) => apiFetch(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id) => apiFetch(`/employees/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (empId) => apiFetch(`/employees/${empId}/products`),
  addProduct: (empId, data) => apiFetch(`/employees/${empId}/products`, { method: 'POST', body: JSON.stringify(data) }),
  deleteProduct: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),

  // Leads
  getLeads: (empId) => apiFetch(`/employees/${empId}/leads`),
  // Public Lead Capture (No Token needed usually, handled by backend logic or conditional)
  sendLead: (empId, data) => fetch(`${API_URL}/employees/${empId}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  }).then(r => r.json()),

  // Public Profile
  getPublicProfileBySlug: (slug) => fetch(`${API_URL}/public/profile?slug=${slug}`).then(r => r.json()),
  getPublicProfileById: (pid) => fetch(`${API_URL}/public/profile?pid=${pid}`).then(r => r.json()),
  
  // Analytics
  trackView: (empId, countryCode) => fetch(`${API_URL}/employees/${empId}/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode })
  }),
};