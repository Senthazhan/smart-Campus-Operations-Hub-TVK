import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { User, Mail, Lock, Building, Phone, UserPlus, AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi(formData);
      if (res.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        setError(res.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join SmartCampus to manage your campus tasks"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            icon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            icon={<User className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            icon={<Building className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl gap-2 text-lg font-bold shadow-lg shadow-blue-100 mt-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Create Account
            </>
          )}
        </Button>

        <p className="text-center text-slate-600 font-medium">
          Already have an account? {' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
