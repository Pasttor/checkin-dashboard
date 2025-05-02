// // pages/api/pass/google/[id].ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { jwtVerify, SignJWT } from 'jose';

// // Carga la clave JSON desde env
// const serviceAccountJson = JSON.parse(
//   Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT!, 'base64').toString()
// );

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { id } = req.query; // UUID del registro
//   if (req.method !== 'GET' || typeof id !== 'string') {
//     return res.status(400).end();
//   }

//   // 1) Construimos el objeto que insertaremos
//   const eventObject = {
//     id: `${process.env.GOOGLE_ISSUER_ID}.${process.env.GOOGLE_EVENT_CLASS_ID}.${id}`,
//     classId: `${process.env.GOOGLE_ISSUER_ID}.${process.env.GOOGLE_EVENT_CLASS_ID}`,
//     state: 'ACTIVE',
//     textModulesData: [
//       { header: 'Nombre',   body: /* recupera de BD */ '' },
//       { header: 'Email',    body: '' },
//       { header: 'Teléfono', body: '' },
//       { header: 'Rol',      body: '' },
//     ],
//     barcode: {
//       type: 'QR_CODE',
//       value: `https://${req.headers.host}/registro/${id}`,
//     },
//   };

//   // 2) Firmamos un JWT con payload "eventObject"
//   //    Debe seguir la spec de Google Wallet: { "iss","aud","typ","payload": {object} }
//   const iat = Math.floor(Date.now() / 1000);
//   const jwt = await new SignJWT({
//     iss: serviceAccountJson.client_email,
//     aud: 'google',
//     typ: 'savetowallet', 
//     payload: eventObject,
//   })
//     .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: serviceAccountJson.private_key_id })
//     .setIssuedAt(iat)
//     .setExpirationTime(iat + 60 * 60) // 1h
//     .sign(
//       // conviertes la private_key PEM a KeyLike
//       await jose.importPKCS8(serviceAccountJson.private_key, 'RS256')
//     );

//   // 3) Redirigimos al enlace Save to Google Wallet
//   res.redirect(302, `https://pay.google.com/gp/v/save/${jwt}`);
// }
