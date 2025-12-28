import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Password dan Konfirmasi Password tidak sama!");
                }
                const { error } = await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName
                        }
                    }
                });
                if (error) throw error;
                alert('Registrasi berhasil! Silakan login (cek email jika perlu verifikasi).');
                setIsLogin(true);
            }
        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navy-950 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                <div className="text-center mb-8">
                    <img
                        src="/ESTE_LOGO.png"
                        alt="Este.RUN"
                        className="h-12 w-auto mx-auto mb-4 object-contain"
                        style={{
                            filter: `
                                drop-shadow(3px 0 0 #172554) 
                                drop-shadow(-3px 0 0 #172554) 
                                drop-shadow(0 3px 0 #172554) 
                                drop-shadow(0 -3px 0 #172554) 
                                drop-shadow(2px 2px 0 #172554) 
                                drop-shadow(-2px 2px 0 #172554) 
                                drop-shadow(2px -2px 0 #172554) 
                                drop-shadow(-2px -2px 0 #172554)
                                drop-shadow(0 4px 4px rgba(0,0,0,0.3))
                            `
                        }}
                    />
                    <p className="text-gray-500 text-sm">Masuk untuk mulai berlari</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="flex gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nama Depan</label>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                                    placeholder="Agus"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nama Belakang</label>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                                    placeholder="Supri"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">{isLogin ? 'Password' : 'Buat Password'}</label>
                        <input
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                            placeholder="********"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Konfirmasi Password</label>
                            <input
                                type="password"
                                required={!isLogin}
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-navy-900 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-navy-800 transition-colors disabled:opacity-70 flex justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Masuk' : 'Daftar')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    {isLogin ? "Belum punya akun?" : "Sudah punya akun?"} <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-navy-600 hover:underline">{isLogin ? "Daftar" : "Login"}</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
