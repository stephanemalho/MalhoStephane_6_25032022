## MalhoStephane_6_25032022

# 🇫🇷 Construisez une API sécurisée pour une application d'avis gastronomiques 
# 🇬🇧 Build a secure API for a food reviews application 

>## 🖥 Front-end configuration (Angular) 
>
>>### How to install the front-end ?
>
>You can look the *[READ-ME.md](https://github.com/OpenClassrooms-Student-Center/Web-Developer-P6#readme)* file for more informations.

### Clone this repository

```bash
git clone https://github.com/OpenClassrooms-Student-Center/Web-Developer-P6.git
```
>### How to run the front-end

```bash
  cd Web-Developer-P6
  npm install
  npm start
```

>## 📡 Configuration API (back-end)
>>### How to install the back-end ?
>You can look the *[READ-ME.md](https://github.com/stephanemalho/MalhoStephane_6_25032022/blob/main/README.md)* file for more informations.<br>You already there but you can clic for fun 😆
>
### Clone this repository

```bash
git clone https://github.com/stephanemalho/MalhoStephane_6_25032022.git
```
### Create .env file ( require dotenv)

```.env
MONGO_URI= <your_mongo_uri>

JWT_TOKEN= <your_jwt_token>

PASSPHRASE=  <your_passphrase>

IV= <your_iv>

PORT=3000 # default port
```

>### How to run the server

To run the server, you need to install the packages and dependencies:

```bash
  cd MalhoStephane_6_25032022
  npm install
  npm start
```

The server will run on port 3000.

>## Configuration API (back-end) Dependencies

npm install bcrypt bunyan colors cors crypto crypto-js dotenv express express-hateoas-links express-mongo-sanitize express-rate-limit express-slow-down express-validator helmet jsonwebtoken mongoose mongoose-unique-validator multer


Updated on: 2022-06-17
package.json:

```package.json
  "dependencies": {
    "bcrypt": "^5.0.1",
    "bunyan": "^1.8.15",
    "colors": "^1.4.0",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "crypto-js": "^4.1.1",
    "dotenv": "^16.0.0",
    "express": "^4.17.3",
    "express-hateoas-links": "^1.3.1",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^6.4.0",
    "express-slow-down": "^1.4.0",
    "express-validator": "^6.14.1",
    "helmet": "^5.1.0",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.2.9",
    "mongoose-unique-validator": "^3.0.0",
    "multer": "^1.4.5-lts.1"
  }
```


## Thanks for watching






