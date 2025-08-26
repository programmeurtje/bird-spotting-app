# Contributing to Vogelspot

Bedankt voor je interesse in het bijdragen aan Vogelspot! 🐦

## Development Setup

### Vereisten

- Node.js 18+
- npm of yarn
- Expo CLI
- Git

### Lokale Setup

1. Fork de repository
2. Clone je fork: `git clone https://github.com/jouw-username/vogelspot-app.git`
3. Installeer dependencies: `npm install`
4. Start development server: `npm start`

## Code Guidelines

### TypeScript

- Gebruik TypeScript voor alle nieuwe code
- Definieer interfaces voor alle data structuren
- Gebruik strict type checking

### React Native / Expo

- Gebruik functionele componenten met hooks
- Volg React Native best practices
- Test op zowel iOS als Android

### Code Style

- Gebruik Prettier voor formatting
- Volg ESLint regels
- Schrijf duidelijke commit messages

### Hooks

- Houd hooks simpel en gefocust
- Gebruik useCallback voor event handlers
- Documenteer complexe hooks

## Pull Request Process

1. **Maak een feature branch**

   ```bash
   git checkout -b feature/nieuwe-feature
   ```

2. **Maak je wijzigingen**

   - Schrijf tests waar mogelijk
   - Update documentatie
   - Test op meerdere devices

3. **Commit je wijzigingen**

   ```bash
   git commit -m "feat: voeg nieuwe feature toe"
   ```

4. **Push naar je fork**

   ```bash
   git push origin feature/nieuwe-feature
   ```

5. **Maak een Pull Request**
   - Beschrijf wat je hebt gewijzigd
   - Voeg screenshots toe voor UI wijzigingen
   - Link naar relevante issues

## Commit Message Format

Gebruik conventional commits:

- `feat:` nieuwe feature
- `fix:` bug fix
- `docs:` documentatie wijzigingen
- `style:` code formatting
- `refactor:` code refactoring
- `test:` tests toevoegen
- `chore:` maintenance

Voorbeelden:

```
feat: voeg notificatie instellingen toe
fix: los locatie permission probleem op
docs: update README met nieuwe features
```

## Testing

### Handmatig Testen

- Test op echte devices (iOS en Android)
- Test alle user flows
- Test edge cases (geen internet, geen locatie, etc.)

### Automated Testing

- Run TypeScript check: `npx tsc --noEmit`
- Test builds: `expo build:ios` / `expo build:android`

## Bug Reports

Gebruik GitHub Issues voor bug reports:

**Template:**

```
**Bug Beschrijving**
Korte beschrijving van het probleem

**Stappen om te Reproduceren**
1. Ga naar...
2. Klik op...
3. Zie fout

**Verwacht Gedrag**
Wat had er moeten gebeuren

**Screenshots**
Voeg screenshots toe indien relevant

**Device Info**
- OS: iOS 16.0 / Android 12
- Device: iPhone 14 / Samsung Galaxy S22
- App versie: 1.0.0
```

## Feature Requests

Voor nieuwe features:

1. Check eerst of het al bestaat in Issues
2. Beschrijf de use case
3. Leg uit waarom het nuttig is
4. Voeg mockups toe indien mogelijk

## Code Review

Alle PRs worden gereviewd op:

- Code kwaliteit
- Performance impact
- User experience
- Compatibility (iOS/Android)
- Security

## Development Tips

### Debugging

- Gebruik React Native Debugger
- Check Expo logs: `expo logs`
- Test API calls in browser eerst

### Performance

- Gebruik React.memo voor expensive components
- Optimize images en assets
- Test op oudere devices

### API Integration

- Test API calls met Postman eerst
- Handle network errors gracefully
- Implement proper loading states

## Questions?

- Open een GitHub Issue voor vragen
- Check de README voor setup problemen
- Test eerst met de ingebouwde Test functionaliteit

Bedankt voor je bijdrage! 🙏
