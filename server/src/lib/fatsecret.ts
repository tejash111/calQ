let cachedToken: string | null = null;
let tokenExpirationTime: number | null = null;

export async function getFatSecretAccessToken(): Promise<string> {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "YOUR_FATSECRET_CLIENT_ID") {
    throw new Error('FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set in .env');
  }

  // Check if we have a valid cached token (buffer of 5 minutes to prevent edge cases)
  const now = Date.now();
  if (cachedToken && tokenExpirationTime && now < tokenExpirationTime - 5 * 60 * 1000) {
    return cachedToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=basic'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FatSecret OAuth error:', errorText);
      throw new Error(`Failed to generate FatSecret access token: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    
    // Cache the token and its expiration
    cachedToken = data.access_token;
    // expires_in is in seconds, typically 86400 (24 hours)
    tokenExpirationTime = now + (data.expires_in * 1000);
    
    console.log('Successfully generated new FatSecret access token');
    return cachedToken as string;
  } catch (error) {
    console.error('Error generating FatSecret token:', error);
    throw error;
  }
}
