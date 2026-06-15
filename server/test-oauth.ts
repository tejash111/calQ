import "dotenv/config";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

async function run() {
  const oauth = new OAuth({
    consumer: {
      key: process.env.FATSECRET_CLIENT_ID || "",
      secret: process.env.FATSECRET_CLIENT_SECRET || "",
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64");
    },
  });

  const baseUrl = "https://platform.fatsecret.com/rest/server.api";
  const requestData = {
    url: baseUrl,
    method: "GET",
    data: {
      method: "food.get.v5",
      format: "json",
      food_id: "3092",
      include_food_images: "true",
      include_food_attributes: "true"
    },
  };

  const authHeaders = oauth.authorize(requestData);
  const signedUrl = baseUrl + "?" + new URLSearchParams({ ...requestData.data, ...authHeaders } as any).toString();

  const response = await fetch(signedUrl);
  const data = await response.json();
  console.log("Images for 1641:", JSON.stringify(data.food?.food_images || "NO_IMAGES", null, 2));
}

run().catch(console.error);
