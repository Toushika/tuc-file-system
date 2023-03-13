import axios from "axios";
import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import classes from './AuthForm.module.css';


const SignUpForm = () => {
    const auth = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(false);
    const emailInputRef = useRef();
    const passwordInputRef = useRef();
    const firstNameInputRef = useRef();
    const lastNameInputRef = useRef();
    const navigate = useNavigate();

    const switchAuthModeHandler = () => {
        setIsLogin((prevState) => !prevState);
    };
    const userSignup = async () => {
        const enteredEmail = emailInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;
        const enteredFirstName = firstNameInputRef.current.value;
        const enteredLastName = lastNameInputRef.current.value;
        // console.log(enteredEmail);
        //localhost:5000/user/signup
        const insertUserUrl = "http://localhost:5000/user/signup";

        await axios.post(insertUserUrl, {
            "firstName": enteredFirstName,
            "lastName": enteredLastName,
            "email": enteredEmail,
            "password": enteredPassword
        })
            .then(res => {
                console.log(res.data);
                if (res.data) {
                    // return success
                    if (res.status === 200 || res.status === 201) {
                        alert("Status Code -" + res.status + " . " + "New user has created successfully");
                        return res;

                    }
                    // reject errors & warnings
                    return Promise.reject(res);
                }



            });

    }
    const userLogin = () => {
        const enteredEmail = emailInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;
        const loginUserUrl = "http://localhost:5000/user/login";
        axios.post(loginUserUrl, ({
            "email": enteredEmail,
            "password": enteredPassword
        })).then(res => {
            console.log(res.data);
            auth.login(res.data.userID, res.data.token, res.data.roleId, res.data.userName);
        });



    };
    const submitHandler = (event) => {
        event.preventDefault();
        if (isLogin) {
            userLogin();
            console.log(auth.login());
            auth.login();
            navigate("/");

        } else {
            userSignup();
            navigate("/");

        }

    }

    return (
        <Modal>


            <div className={classes.auth}>

                <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

                <form onSubmit={submitHandler} >
                    {!isLogin ? <Input label="FirstName" ref={firstNameInputRef} input={{
                        id: 'first_name',
                        type: 'text',
                        placeholder: 'First Name'
                    }} />
                        : ''}
                    {!isLogin ?
                        <Input label="LastName" ref={lastNameInputRef} input={{
                            id: 'last_name',
                            type: 'text',
                            placeholder: 'Last Name'
                        }} /> : ''}
                    <Input label="email" ref={emailInputRef} input={{
                        id: 'email',
                        type: 'text',
                        placeholder: 'email'
                    }} />
                    <Input label="password" ref={passwordInputRef} input={{
                        id: 'password',
                        type: 'password',
                        placeholder: 'password'
                    }} />

                    <div className={classes.actions}>
                        <button>{isLogin ? 'Login' : 'Create Account'}</button>
                        <button
                            type='button'
                            className={classes.toggle}
                            onClick={switchAuthModeHandler}
                        >
                            {isLogin ? 'Create new account' : 'Login with existing account'}
                        </button>

                    </div>
                </form>

            </div>

        </Modal>
    );
};

export default SignUpForm;
