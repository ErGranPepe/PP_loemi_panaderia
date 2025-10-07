import React, { useState } from 'react';

interface AdminLoginProps {
    onLoginSuccess: () => void;
    onBack: () => void;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '123';

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            onLoginSuccess();
        } else {
            setError('Contraseña incorrecta');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-stone-800 text-center mb-6">Acceso de Administrador</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="password-admin" className="block text-sm font-medium text-stone-700">Contraseña</label>
                        <input
                            type="password"
                            id="password-admin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                    <div className="flex flex-col space-y-3 pt-2">
                        <button type="submit" className="w-full px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900">Entrar</button>
                        <button type="button" onClick={onBack} className="w-full px-4 py-2 bg-stone-200 text-stone-800 font-semibold rounded-lg hover:bg-stone-300">Volver a la web</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;