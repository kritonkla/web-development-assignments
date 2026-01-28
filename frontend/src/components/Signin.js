import React, { useState } from 'react';

const CEI_LOGO_URL = "https://cei.kmitl.ac.th/wp-content/uploads/2024/09/cropped-ceip-fav-1.png"; 

const API_URL = process.env.REACT_APP_API_URL;

const previewAvatar = (event) => {
    const file = event.target.files[0];
    const avatar = document.getElementById("avatarPreview");

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            avatar.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
}

const showForm = (formID) => {
    document.querySelectorAll(".form-box").forEach(form => {form.classList.remove("active");});
    document.getElementById(formID).classList.add("active");
}


function Signin() {
    
    return (
        <> 
            <div className="form-box active" id="login-form">
                <form action="">
                    <h2>Login</h2>
                    <input type="email" name="email" placeholder="Email" required/>
                    <input type="password" name="password" placeholder="Password" required/>
                    <button type="submit" name="Login">Login</button>
                    {/*TODO: fix link*/}
                    <p>Don't have an account? <a href="#" onClick={() => showForm('register-form')}>Register</a></p>
                </form>
            </div>

            <div className="form-box" id="register-form">
                <form action="">
                    <h2>Register</h2>
                    <div className="avatar-wrapper">
                        <img
                            src="default-avatar.png"
                            alt="Avatar Preview"
                            id="avatarPreview"
                            className="avatar"
                            onClick={() => document.getElementById('avatarInput').click()}
                        />
                        <input
                            type="file"
                            id="avatarInput"
                            name="profile"
                            accept="image/*"
                            hidden
                            onChange={previewAvatar}
                            required
                        />
                    </div>

                    <input type="text" name="name" placeholder="Name" required/>
                    <input type="email" name="email" placeholder="Email" required/>
                    <input type="password" name="password" placeholder="Password" required/>
                    <button type="submit" name="Login">Login</button>
                    {/*TODO: fix link*/}
                    <p>Already have an account? <a href="#" onClick={() => showForm('login-form')}>Login</a></p> 
                </form>
            </div>
        </>
    )
}