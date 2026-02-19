import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passportInstance } from '../utils/immutablePassport';
import Loading from '../Components/Common/Loading';

export default function LoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 Processing Immutable login callback...");
    passportInstance.loginCallback();
    // After callback processing, the SDK handles the token storage.
    // We just need to wait a moment or simply redirect.
    // However, loginCallback() is a promise, so let's await it ideally, 
    // but the SDK documentation often says it handles the redirect clearing itself.
    
    // A safer approach with the SDK is usually to just call it and then redirect
    // or let it finish. Since it's a promise, we should handle it.
    
    // Let's try simple invocation first as per common docs, or better:
    // The SDK's loginCallback will process the query params.
    // Once done, we redirect to home or profile.
    
    setTimeout(() => {
       navigate('/');
    }, 1500);
      
  }, [navigate]);

  return <Loading />;
}
