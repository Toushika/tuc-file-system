import { React, useState, useEffect, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import AuthPage from './pages/AuthPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import AdminPanel from './pages/AdminPanel';
import FileViewPage from './pages/FileViewPage';
import FileUploadPage from './pages/FileUploadPage';
import { AuthContext } from './context/AuthContext';
import ViewOwnFilePage from './pages/ViewOwnFilePage';
import ViewRequestByUserPage from './pages/ViewRequestByUserPage';

let logoutTimer;
function App() {
  //const [isLogedIn,setIsLogin]=useState(false);
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userID, setUserID] = useState(false);
  const [roleId, setRoleId] = useState(false);
  const [userName, setUserName] = useState();

  const login = useCallback((uid, token_key, roleId, userName, expirationDate) => {
    //setIsLogin(true);
    setUserID(uid);
    setToken(token_key);
    setRoleId(roleId);
    setUserName(userName);

    // const tokenExpirationDate =expirationDate || new Date(new Date().getTime() + 3000);
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem('userData', JSON.stringify({
      userID: uid,
      token: token_key,
      roleId: roleId,
      userName: userName,
      expiration: tokenExpirationDate.toISOString(),
    }))

  }, []);
  const logout = useCallback(() => {
    //setIsLogin(false);

    setToken(null);
    setTokenExpirationDate(null);
    setUserID(null);
    setRoleId(null);
    setUserName(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token &&
      new Date(storedData.expiration) > new Date()) {
      login(storedData.userID, storedData.token, storedData.roleId, storedData.userName, new Date(storedData.expiration))
    }
    // if()
  }, [login]);



  return (
    <AuthContext.Provider value={{ isLogedIn: !!token, login: login, logout: logout, token: token, userID: userID, roleId: roleId, userName: userName }}>
      <Layout>
        <Routes >

          <Route path='/' element={<HomePage />} />
          {token && roleId === 1 &&
            <Route path='/admin' element={<AdminPanel />} />
          }
          {
            token && <Route path='/upload-files' element={<FileUploadPage />} />
          }
          {token &&
            <Route path='/view-my-files' element={<ViewOwnFilePage />} />
          }

          {token &&
            <Route path='/view-requests' element={<ViewRequestByUserPage />} />
          }

          <Route path='/view-files' element={<FileViewPage />} />
          <Route path='/auth' element={<AuthPage />} />
          <Route path='/signup' element={<SignUpPage />} />

          <Route path="*" element={<p>There's nothing here: 404!</p>} />

        </Routes>



      </Layout>
    </AuthContext.Provider>
  );
}

export default App;