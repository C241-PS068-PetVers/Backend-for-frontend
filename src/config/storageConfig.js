const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

// Google Cloud Storage and Multer configuration
const storage = new Storage({
  projectId: 'petverse-423806',
  credentials: {
    client_email: 'petverse-admin@petverse-423806.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDAB3eif72UapPC\nZmrU3UCVaJYZZiinmYiqtSPotYaPYRVD8Dq1OI7Iy3ncBOlSwb/rGyopCT2PscDO\naNGMYI6Bw9MQGZLGCw//6obf3GZ6hdXauuM1a5aTGqIg/Em3QTQ0okdnEZu7x4UV\nDr0+bXWPM0r8ru4iaArMNbw6rBY7gtmh8ZmjUYDjc0l0Z1R1FLK4RqPlAfcX3JzK\nlow2qCu+t/jUAuz1FshMa+H4UBfKZ+BR/BZzrR4/Yinuj59TGDPuEjxI1DrcZ0p9\nx+ILXBzg3+me/CxB0zOQiYSLSO7almU5G5KdsW1HLcuqnwXNR2klg66SEuInPgnJ\nvigiA/hfAgMBAAECggEACX7fs1A4GL1wNLmNOkfFAzAjf/pcpYLJzqz4R+H9LJVR\ndCjca6jj64QRMLoajuKteOLrYdim9n12iHPAkH2lms1up0Lg6vjnLgbelmeeDBxs\nAmMv/Z5tSsN2x0Ue59TDFw6KIegfYycAwBVuHMbiirJMH81jw0gfrztP5VPzdwvq\ngz3gqOUCTJIXxzJe6NMMtwSygBNRR0+QLVrn7ysHYZsCYYmo52DTz5qTSu3d7fKj\nNzyW/DgIivum5D4NereJSfoPHXBeAteRUuhHDP+r9TBD47Hxt2xFbYif96bIR1ca\nbNOVB7LA0TtuDHjx2wgWtY1ZWMDxFPY30gV7lHtWiQKBgQDkYNwPvFGr0kczuBcx\ngIUBTer2B3aSZQkPgpQee4HgecQjwY3WIW5jfUOzBHjdidEgo8Xc4yFUuntDlef4\nv+oaL5u4JMzGNMekPpPpcavrQDVie48D/YjrMQGG0GpLTvUGDBPTQO9JEnx7mett\nj3+8YctapVC41aUlZkq8T431VwKBgQDXQSZdEsIES5WM6VCq/sN9EBrT0GJjmZvc\njfhmV/UBlT3gthm8gseWDgB6qyloCj1U0uBYLVKiwN2SHZR7OHrO8Zfkmi0KB8xC\ncYKgd/q7tDIAiNRL2elb8tSN89g7jWZGotLyS9KEuJOmZYrbE776xhySRRh9Qz2J\n7MtcUwtoOQKBgQDd/MSLSxr78Aaj4CIzTOB8Fxf3k+OOg0UeXWfKhXUGFHYx51cO\nOCrL7BvdK9CsTuUHXAndHq3sZOOiG1mDclCEqZgskyC03OLd5LHzrTlWD3CUzNOE\nJnJrYpRATd+0WghTm3O92ZV+Ksjzf/bW5TBdlZWMA7sGHy1KwDaO+qlbOwKBgQCw\nQuAIPND0tXPrpC3zJ5SqdyKQqcW3a1RuwS5Tl9i/iBbYSCVA8RI/9I095aSNVj0s\nlVUxv0M4lJebC2/HitM9XCWWAw24dfQzwEFH55dAVujO+TxmNDVbnreg2bkJ4tqK\nItB7qczj80Ssb9/JTx0Gum0w9TV9dS8SHv3TRwlDOQKBgQCA5RZntmYTXJq6021l\n6bSFSil4tooy3v0o0AC/KwQa8dVRMoe3eKsyNgCHUF+8LsE//fgyOsGLacDUp0bx\n+00nlsEWEefu/0iKfQ2lZXutvedDSLzBGMjeoo3+Zcv0x5lpd5yNDEYDTShdvbVX\n8AxsWZkasNDm0qaxpnxy257sTA==\n-----END PRIVATE KEY-----\n'
  }
});

// Replace 'your-bucket-name' with your actual GCP bucket name
const bucket = storage.bucket('storage-imagebucket');

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

module.exports = { upload, bucket };