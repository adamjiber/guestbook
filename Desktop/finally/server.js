let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs');

let port = 8080;
// Hämtar mina statiska filer från min mapp "styles"
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.urlencoded({ extended: true }));
// Hämtar informationen från users.json
app.get('/', function(req, res) {
  // Läser datan från users.json
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
  // Om det blir fel, så skicka ett felmeddelande.    
      console.error('Fel vid läsning av filen:', err);
      return res.status(500).send('Serverfel');
    }
// Gör om json-filen till javascript objekt.
    const usersData = JSON.parse(data);
    let output = "";
    // För varje användare som skriver så skapa detta i HTML-kod
    if (usersData && usersData.length > 0) {
      for (let i = 0; i < usersData.length; i++) {
        output += `<p><b>${usersData[i].name}</b> från ${
          usersData[i].homepage || "ingen hemsida"
        } skriver: <br><i>${usersData[i].message}</i></p><hr>`;
      }
    }
    // Läs innehållet från filen som heter index.html
    let html = fs.readFileSync(__dirname + "/index.html").toString();
    // Ersätt detta med det som skrivits in av användaren.
    html = html.replace('<div class="post"></div>', `<div class="post"><ul>${output}</ul></div>`);
    // Skicka den informationen till klienten.
    res.send(html);
  });
});
//Hantera POST-förfrågningar för att lägga till ny användarinformation
app.post('/submit', function(req, res) {
  const { name, email, phonenumber, homepage, message } = req.body;

  const userData = {
    name,
    email,
    phonenumber,
    homepage,
    message
  };
// Läser ifrån filen users.json
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Fel vid läsning av filen:', err);
    } else {
//Parsa befintliga användare eller använd en tom array om filen är tom
      const users = JSON.parse(data || '[]');
      // Lägger till nya användare med ny information
      users.push(userData);
      // Skriv användarinformation till users.json-filen
      fs.writeFile('users.json', JSON.stringify(users), (err) => {
        if (err) {
          console.error('Fel vid skrivning till filen:', err);
          return res.status(500).send('Serverfel');
        }
        //Efter att informationen har lagts till, omdirigera till första sidan
        res.redirect('/');
      });
    }
  });
});

app.listen(port, function() {
  console.log(`Server running on port ${port}`);
});

