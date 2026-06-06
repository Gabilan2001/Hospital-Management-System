import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '../../features/auth/authSlice';

const AuthBootstrap = () => {
  const dispatch = useDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    dispatch(restoreSession());
  }, [dispatch]);

  return null;
};

export default AuthBootstrap;
