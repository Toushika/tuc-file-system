import { createContext } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    userID:null,
    token: null,
    roleId: null,
    userName:null,
    login: () => { },
    logout: () => { }
});
