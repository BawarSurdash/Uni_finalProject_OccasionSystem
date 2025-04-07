import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    
    const [values, setValues] = useState({
        email: '',
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
            const response = await axios.post('http://localhost:3000/auth/login', values);
            console.log(response);
            if(response.status===201){
                localStorage.setItem('token',response.data.token);
                navigate('/');
            }
        } catch (error) {
            console.log(error);
        }
    }  


    return (<div className='mt-16'>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8
        ">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Login here
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/signup" 
                                className="font-medium text-orange-600 hover:text-orange-500"
                            >
                              Sign up here
                            </Link>
                        </p>
                    </div>

                 

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    onChange={handleChanges}
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
                             
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    onChange={handleChanges}
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
                             
                                />
                            </div>
                        </div>

                

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150"
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
