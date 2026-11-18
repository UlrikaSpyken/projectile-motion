# Kasthöjd

En fristående webbsida för att utforska kaströrelse. Följ bollen i ett
koordinatsystem och läs av dess aktuella position medan simuleringen spelas upp.
Den använder vanlig HTML, CSS och JavaScript och behöver varken byggas eller
installeras. Öppna `index.html` i en webbläsare för att använda sidan lokalt.

## Ändra fysik och undervisningstexter

- Ändra alla rubriker, instruktioner, förklaringar och formler i `content.js`.
- Ändra tyngdaccelerationen, startvärdena, reglagens intervall,
  uppspelningshastigheten och färgerna för sparade banor i `physics.js`.
- Själva beräkningarna för kaströrelsen finns också samlade i `physics.js`.
- `app.js` kopplar beräkningarna till reglagen och animationen. `styles.css`
  styr utseendet.

Koordinatsystemets skala är densamma för alla kast och dimensioneras efter
reglagens maxvärden. Välj fart och vinkel och tryck på **Spara kast** för att
behålla banan i en ny färg. **Rensa kast** tar bort alla sparade banor.

## Publicera på GitHub Pages

1. Lägg filerna i rotmappen på ett GitHub-repository.
2. Öppna repositoryts **Settings → Pages**.
3. Under **Build and deployment**, välj **Deploy from a branch**.
4. Välj grenen `main` och mappen `/(root)`, spara och öppna länken som GitHub
   visar när publiceringen är klar.

Alla filer länkas relativt till `index.html`, så sidan fungerar både på en
egen domän och på GitHub Pages projektsidor.
