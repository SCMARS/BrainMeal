import  { useState } from 'react';
import './styles/Login.css';
import roundImg from './round.jpg';
import imgpng from './img.png';


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ email, password });
    };

    return (
        <div className="login-container">
            {/* Левая часть с логотипом */}
            <div className="left-section">
                <img src={imgpng} alt="BrainMeal" className="logo" />
            </div>

            {/* Правая часть с формой */}
            <div className="right-section">
                <img src={roundImg}alt="BrainMeal" className="logo-small" />

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label-orange">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <label className="label-black">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div className="checkbox-group">
                        <input type="checkbox" id="personalizedMeal" className="custom-checkbox" />
                        <label htmlFor="personalizedMeal" className="checkbox-label">Remember me</label>
                    </div>

                    <button type="submit" className="login-button">
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;




