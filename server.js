const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// const serviceAccount = require('./serviceAccountKey.json');
const serviceAccount = {
  "type": "service_account",
  "project_id": "petverse-423806",
  "private_key_id": "9d89b55f739cbfca4e064b980ebbc46a0fde7ed3",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDAB3eif72UapPC\nZmrU3UCVaJYZZiinmYiqtSPotYaPYRVD8Dq1OI7Iy3ncBOlSwb/rGyopCT2PscDO\naNGMYI6Bw9MQGZLGCw//6obf3GZ6hdXauuM1a5aTGqIg/Em3QTQ0okdnEZu7x4UV\nDr0+bXWPM0r8ru4iaArMNbw6rBY7gtmh8ZmjUYDjc0l0Z1R1FLK4RqPlAfcX3JzK\nlow2qCu+t/jUAuz1FshMa+H4UBfKZ+BR/BZzrR4/Yinuj59TGDPuEjxI1DrcZ0p9\nx+ILXBzg3+me/CxB0zOQiYSLSO7almU5G5KdsW1HLcuqnwXNR2klg66SEuInPgnJ\nvigiA/hfAgMBAAECggEACX7fs1A4GL1wNLmNOkfFAzAjf/pcpYLJzqz4R+H9LJVR\ndCjca6jj64QRMLoajuKteOLrYdim9n12iHPAkH2lms1up0Lg6vjnLgbelmeeDBxs\nAmMv/Z5tSsN2x0Ue59TDFw6KIegfYycAwBVuHMbiirJMH81jw0gfrztP5VPzdwvq\ngz3gqOUCTJIXxzJe6NMMtwSygBNRR0+QLVrn7ysHYZsCYYmo52DTz5qTSu3d7fKj\nNzyW/DgIivum5D4NereJSfoPHXBeAteRUuhHDP+r9TBD47Hxt2xFbYif96bIR1ca\nbNOVB7LA0TtuDHjx2wgWtY1ZWMDxFPY30gV7lHtWiQKBgQDkYNwPvFGr0kczuBcx\ngIUBTer2B3aSZQkPgpQee4HgecQjwY3WIW5jfUOzBHjdidEgo8Xc4yFUuntDlef4\nv+oaL5u4JMzGNMekPpPpcavrQDVie48D/YjrMQGG0GpLTvUGDBPTQO9JEnx7mett\nj3+8YctapVC41aUlZkq8T431VwKBgQDXQSZdEsIES5WM6VCq/sN9EBrT0GJjmZvc\njfhmV/UBlT3gthm8gseWDgB6qyloCj1U0uBYLVKiwN2SHZR7OHrO8Zfkmi0KB8xC\ncYKgd/q7tDIAiNRL2elb8tSN89g7jWZGotLyS9KEuJOmZYrbE776xhySRRh9Qz2J\n7MtcUwtoOQKBgQDd/MSLSxr78Aaj4CIzTOB8Fxf3k+OOg0UeXWfKhXUGFHYx51cO\nOCrL7BvdK9CsTuUHXAndHq3sZOOiG1mDclCEqZgskyC03OLd5LHzrTlWD3CUzNOE\nJnJrYpRATd+0WghTm3O92ZV+Ksjzf/bW5TBdlZWMA7sGHy1KwDaO+qlbOwKBgQCw\nQuAIPND0tXPrpC3zJ5SqdyKQqcW3a1RuwS5Tl9i/iBbYSCVA8RI/9I095aSNVj0s\nlVUxv0M4lJebC2/HitM9XCWWAw24dfQzwEFH55dAVujO+TxmNDVbnreg2bkJ4tqK\nItB7qczj80Ssb9/JTx0Gum0w9TV9dS8SHv3TRwlDOQKBgQCA5RZntmYTXJq6021l\n6bSFSil4tooy3v0o0AC/KwQa8dVRMoe3eKsyNgCHUF+8LsE//fgyOsGLacDUp0bx\n+00nlsEWEefu/0iKfQ2lZXutvedDSLzBGMjeoo3+Zcv0x5lpd5yNDEYDTShdvbVX\n8AxsWZkasNDm0qaxpnxy257sTA==\n-----END PRIVATE KEY-----\n",
  "client_email": "petverse-admin@petverse-423806.iam.gserviceaccount.com",
  "client_id": "100592625025917211587",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/petverse-admin%40petverse-423806.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require('./src/routes/auth');
const postRoutes = require('./src/routes/posts');
const userRoutes = require('./src/routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
