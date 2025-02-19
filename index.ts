import type { OAuth2Adapter } from "adminforth";

export default class AdminForthAdapterGoogleOauth2 implements OAuth2Adapter {
    private clientID: string;
    private clientSecret: string;
    private redirectUri: string;
  
    constructor(options: {
      clientID: string;
      clientSecret: string;
      redirectUri: string;
    }) {
      this.clientID = options.clientID;
      this.clientSecret = options.clientSecret;
      this.redirectUri = options.redirectUri;
    }
  
    getAuthUrl(): string {
      const params = new URLSearchParams({
        client_id: this.clientID,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline'
      });
      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return url;
    }
  
    async getTokenFromCode(code: string): Promise<{ email: string; name?: string; picture?: string }> {
      
      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: this.clientID,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }),
      });
  
      const tokenData = await tokenResponse.json();
  
      if (tokenData.error) {
        console.error('Token error:', tokenData);
        throw new Error(tokenData.error_description || tokenData.error);
      }
  
      // Get user info using access token
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
  
      const userData = await userResponse.json();
  
      if (userData.error) {
        throw new Error(userData.error_description || userData.error);
      }
  
      return {
        email: userData.email,
      };
    }

    getIcon(): string {
      return `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>`;
    }
  }