import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const prerender = false;

const serviceAccountAuth = new JWT({
  email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: import.meta.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  import.meta.env.GOOGLE_SPREADSHEET_ID,
  serviceAccountAuth
);

export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  const { question, name, subscribe, email } = await request.json();

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({ date: new Date().toISOString(), name, question });

    if (subscribe) {
      await fetch("https://sendy.polpiella.dev/subscribe", {
        method: "POST",
        body: JSON.stringify({
          api_key: import.meta.env.SENDY_API_KEY,
          email,
          list: import.meta.env.SENDY_LIST_ID,
          boolean: true,
          ...(name && { name }),
        }),
      });
    }
  } catch (e) {
    console.error(e);
    return new Response(`${e}`, { status: 500 });
  }

  return new Response(null, { status: 200 });
}
