import "dotenv/config";

async function run() {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const tokenRes = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic'
  });

  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  console.log("Token generated:", token);

  const searchRes = await fetch('https://platform.fatsecret.com/rest/server.api?method=foods.search&format=json&search_expression=chicken&max_results=5', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const searchData = await searchRes.json();
  console.log(JSON.stringify(searchData, null, 2));
}

run().catch(console.error);
