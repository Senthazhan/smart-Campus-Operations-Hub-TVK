import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import { fetchMe } from '../api/authApi';

export function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, updateUser } = useAuth();

    const hasProcessed = React.useRef(false);

    useEffect(() => {
        if (location.pathname !== '/oauth2/redirect' || hasProcessed.current) {
            return;
        }

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const role = params.get('role') || 'USER';
        const fullName = params.get('fullName') || 'OAuth User';
        const email = params.get('email') || '';

        if (token) {
            hasProcessed.current = true;

            // 1) Store token with a temporary user so axios can send Authorization
            const tempUser = {
                role,
                username: email || fullName,
                fullName,
                email,
            };
            login(tempUser, token);

            // 2) Try to fetch the real user profile to get proper name/email/etc.
            fetchMe()
                .then((res) => {
                    if (res.success && res.data) {
                        updateUser(res.data);
                    }
                })
                .catch(() => {
                    // If profile fetch fails, keep temp user – don't break login
                });

            // 3) Navigate based on role with absolute paths
            const target = role === 'ADMIN' ? '/dashboard' :
                          role === 'TECHNICIAN' ? '/technician/dashboard' :
                          '/welcome';

            navigate(target, { replace: true });
        } else {
            const error = params.get('error');
            navigate('/login', {
                replace: true,
                state: { error: error || 'Google login failed. Please try again.' }
            });
        }
    }, [location.pathname, location.search, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <Spinner size="lg" className="mx-auto text-indigo-500" />
                <p className="text-slate-600 font-semibold text-lg">Finalizing secure session...</p>
                <p className="text-slate-400 text-sm">You'll be redirected momentarily.</p>
            </div>
        </div>
    );
}
