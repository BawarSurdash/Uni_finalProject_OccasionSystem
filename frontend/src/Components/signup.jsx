import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    
    const [values, setValues] = useState({
        username: '',
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
            const response = await axios.post('http://localhost:3000/auth/signup', values);
            console.log(response);
            if(response.status===201){
                alert('Account created successfully!');
                navigate('/login');
            }
        } catch (error) {
            console.log(error);
            alert('Account already exists');
        }
    }  


    return (<div className='mt-16'>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8
        ">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Create New Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="font-medium text-orange-600 hover:text-orange-500"
                            >
                                Login here
                            </Link>
                        </p>
                    </div>

                 

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    onChange={handleChanges}
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
                           
                                />
                            </div>
                        </div>

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
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150"
                            >
                                {/* Google SVG Icon */}
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                                </svg>
                            </button>

                        
                        </div>
                    </div>
                </div>
            </div>
        </div></div>
    );
}

export default Signup;
