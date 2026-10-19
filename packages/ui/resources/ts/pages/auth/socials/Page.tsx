import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Page(){
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem(
        'token',
        token
      );

      navigate('/');
    }

    if (error) {
      console.error(error);
      navigate('/login');
    }
  }, []);

  return <div>Loading...</div>;
}
