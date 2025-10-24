import { useMsal } from "@azure/msal-react";

export const LoginButton =  () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: 'create',
    });
  };

  return <button onClick={handleLogin}>Login</button>;
};