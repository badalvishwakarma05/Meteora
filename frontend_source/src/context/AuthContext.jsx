import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_USERS = [
  {
    id: 'user-1',
    name: 'Dr. M. Kumar',
    email: 'dr.kumar@imd.gov.in',
    password: 'password123',
    role: 'Senior Meteorologist',
    department: 'Cyclone Warning Division, IMD',
    station: 'New Delhi HQ',
    avatarInitials: 'MK',
  },
  {
    id: 'user-2',
    name: 'Dr. P. Sharma',
    email: 'p.sharma@imd.gov.in',
    password: 'password123',
    role: 'Operational Forecaster',
    department: 'Area Cyclone Warning Centre (ACWC), Kolkata',
    station: 'Kolkata ACWC',
    avatarInitials: 'PS',
  },
  {
    id: 'user-3',
    name: 'Disaster Command Admin',
    email: 'admin@moes.gov.in',
    password: 'password123',
    role: 'System Administrator',
    department: 'Ministry of Earth Sciences (MoES)',
    station: 'Prithvi Bhavan, New Delhi',
    avatarInitials: 'AD',
  },
  {
    id: 'user-4',
    name: 'Rajesh Mohapatra',
    email: 'citizen@coastal.in',
    password: 'password123',
    role: 'Citizen',
    department: 'Civilian / Coastal Resident',
    station: 'Puri Coastal Sector, Odisha',
    district: 'Puri',
    state: 'Odisha',
    phone: '+91 98765 43210',
    avatarInitials: 'RM',
  },
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cyclone_ai_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cyclone_ai_current_user');
    return saved ? JSON.parse(saved) : null; // Starts logged OUT by default
  });

  useEffect(() => {
    localStorage.setItem('cyclone_ai_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cyclone_ai_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cyclone_ai_current_user');
    }
  }, [currentUser]);

  const login = (email, password) => {
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }
    setCurrentUser(user);
    return user;
  };

  const signup = ({ name, email, password, role, department, station, district, phone }) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const isCitizenRole = role === 'Citizen';

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: role || (isCitizenRole ? 'Citizen' : 'Operational Forecaster'),
      department: department || (isCitizenRole ? 'Civilian / Coastal Resident' : 'India Meteorological Department (IMD)'),
      station: station || (isCitizenRole ? `${district || 'Coastal'} Sector` : 'Regional Meteorological Centre'),
      district: district || 'Puri',
      phone: phone || '+91 98765 00000',
      avatarInitials: initials || (isCitizenRole ? 'CZ' : 'IM'),
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cyclone_ai_current_user');
  };

  const loginAsDemo = (demoKey = 'kumar') => {
    const userMap = {
      kumar: DEFAULT_USERS[0],
      sharma: DEFAULT_USERS[1],
      admin: DEFAULT_USERS[2],
      citizen: DEFAULT_USERS[3],
    };
    const user = userMap[demoKey] || DEFAULT_USERS[0];
    setCurrentUser(user);
    return user;
  };

  const loginAsCitizen = () => {
    return loginAsDemo('citizen');
  };

  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    localStorage.setItem('cyclone_ai_current_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isCitizen: currentUser?.role === 'Citizen',
        isAdmin: currentUser && currentUser?.role !== 'Citizen',
        login,
        signup,
        logout,
        loginAsDemo,
        loginAsCitizen,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
