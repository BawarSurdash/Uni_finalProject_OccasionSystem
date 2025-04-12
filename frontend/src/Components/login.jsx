import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ darkMode }) => {
    
    const [values, setValues] = useState({
        username: '',
        password: '',
    });
    const handleChanges = (e) => {
        setValues({...values, [e.target.name]: e.target.value});
    } 
    const navigate=useNavigate();
    const handleSubmit = async  (e) => {
        console.log(values);
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/auth/login', 
                values,
                {
                    headers: {
                        accessToken: localStorage.getItem('token')
                    }
                }
            );
            
            if(response.status === 200){
                localStorage.setItem('token', response.data.token);
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert(error.response?.data?.error || 'Login failed. Please try again.');
        }
    }  


    return (<div className='mt-16'>

        <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-orange-50'} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className={`${darkMode ? 'bg-gray-700 shadow-xl' : 'bg-white shadow-lg'} py-8 px-4 rounded-xl sm:px-10`}>
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Login here
                        </h2>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Don't have an account?{' '}
                            <Link 
                                to="/signup" 
                                className={`font-medium ${darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'}`}
                            >
                              Sign up here
                            </Link>
                        </p>
                    </div>

                 

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div>
                            <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    onChange={handleChanges}
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm transition duration-150 ${
                                        darkMode 
                                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400' 
                                        : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                    }`}
                                    style={darkMode ? { backgroundColor: '#374151', color: 'white' } : {}}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    onChange={handleChanges}
                                    type="password"
                                    required
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm transition duration-150 ${
                                        darkMode 
                                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400' 
                                        : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                    }`}
                                    style={darkMode ? { backgroundColor: '#374151', color: 'white' } : {}}
                                />
                            </div>
                        </div>

                

                        <button
                            type="submit"
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ${
                                darkMode
                                ? 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-orange-400'
                                : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                            }`}
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                            </div>
                           
                        </div>

                       
                    </div>
                </div>
            </div>
        </div></div>
    );
}

export default Login;
