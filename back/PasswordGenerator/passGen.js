import express from 'express';


const app = express();


const passwordGenerater = (length = 12) => {
    // Charset más cómodo pero aún seguro
    const charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?-_=+";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}
export { passwordGenerater };