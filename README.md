# 🐦 Vogelspot - Bird Spotting App

Een moderne React Native app voor het ontdekken van vogelwaarnemingen in je omgeving, gebouwd met Expo en geïntegreerd met waarneming.nl.

## ✨ Features

- 📍 **Locatie-gebaseerd zoeken** - Vind vogels in je directe omgeving
- 🔔 **Smart notificaties** - Ontvang meldingen voor zeldzame vogelwaarnemingen
- 🎯 **Zeldzaamheidsfilters** - Filter op basis van hoe bijzonder een vogel is
- ⚙️ **Aanpasbare instellingen** - Stel zoekradius en notificatievoorkeuren in
- 🌐 **Real-time data** - Live data van waarneming.nl
- 📱 **Cross-platform** - Werkt op iOS en Android

## 🚀 Quick Start

### Vereisten

- Node.js (versie 18 of hoger)
- npm of yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app op je telefoon (optioneel, voor testing)

### Installatie

1. **Clone de repository**

   ```bash
   git clone https://github.com/programmeurtje/bird-spotting-app.git
   cd bird-spotting-app
   ```

2. **Installeer dependencies**

   ```bash
   npm install
   ```

3. **Start de development server**

   ```bash
   npm start
   ```

4. **Test de app**
   - Scan de QR code met Expo Go (iOS/Android)
   - Of druk `i` voor iOS simulator
   - Of druk `a` voor Android emulator

## 📱 App Structuur

```
src/
├── components/          # Herbruikbare UI componenten
├── hooks/              # Custom React hooks
├── screens/            # App schermen
├── services/           # API en externe services
├── types/              # TypeScript type definities
└── utils/              # Helper functies
```

## 🔧 Configuratie

### Locatie Permissies

De app heeft locatie toegang nodig om vogels in je buurt te vinden:

- **iOS**: Automatisch gevraagd bij eerste gebruik
- **Android**: Automatisch gevraagd bij eerste gebruik

### Notificatie Instellingen

Pas notificaties aan in de instellingen:

- Schakel notificaties in/uit
- Stel minimum zeldzaamheid in
- Configureer zoekradius (1-20km)

## 🛠️ Development

### Scripts

```bash
npm start          # Start Expo development server
npm run android    # Start op Android
npm run ios        # Start op iOS
npm run web        # Start web versie
```

### Code Structuur

- **Hooks**: Vereenvoudigde state management
- **Services**: API integratie met waarneming.nl
- **Components**: Modulaire UI componenten
- **TypeScript**: Volledige type safety

### API Integratie

De app gebruikt de waarneming.nl API voor vogeldata:

- Real-time waarnemingen
- Locatie-gebaseerd zoeken
- Zeldzaamheidsclassificatie

## 📦 Dependencies

### Core

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety

### Navigation

- **@react-navigation/native** - Navigation
- **@react-navigation/stack** - Stack navigator

### Storage & State

- **@react-native-async-storage/async-storage** - Local storage

### Location & Notifications

- **expo-location** - GPS functionaliteit
- **expo-notifications** - Push notifications

### API & Network

- **axios** - HTTP client voor API calls

## 🔄 Updates

De app ondersteunt over-the-air updates via Expo:

- Automatische updates bij app start
- Geen app store approval nodig voor kleine wijzigingen

## 🧪 Testing

### Development Testing

- Gebruik de Test scherm in de app voor API testing
- Check locatie, API verbinding en notificaties

### Device Testing

- Test op echte devices via Expo Go
- Test notificaties (werken niet in simulator)

## 🚀 Deployment

### Expo Build

```bash
# Installeer EAS CLI
npm install -g eas-cli

# Login bij Expo
eas login

# Configureer build
eas build:configure

# Maak build
eas build --platform all
```

### Over-the-Air Updates

```bash
# Publiceer update
eas update --branch main --message "Bug fixes"
```

## 📋 Roadmap

- [ ] Background fetch voor automatische updates
- [ ] Offline support met lokale database
- [ ] Foto's van vogelwaarnemingen
- [ ] Social features (delen, favorieten)
- [ ] Uitgebreide filters en zoekopties

## 🐛 Troubleshooting

### Veelvoorkomende Problemen

**Locatie werkt niet**

- Controleer app permissies in telefoon instellingen
- Zorg dat GPS aan staat
- Test op echt device (niet simulator)

**Notificaties komen niet aan**

- Controleer notificatie permissies
- Test op echt device (werkt niet in simulator)
- Check instellingen in de app

**API errors**

- Controleer internetverbinding
- Test API verbinding via Test scherm
- Check console voor details

### Development Issues

**Metro bundler problemen**

```bash
npx expo start --clear
```

**Package conflicts**

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License - zie LICENSE file voor details.

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/nieuwe-feature`)
3. Commit je wijzigingen (`git commit -am 'Voeg nieuwe feature toe'`)
4. Push naar de branch (`git push origin feature/nieuwe-feature`)
5. Maak een Pull Request

## 📞 Support

Voor vragen of problemen:

- Open een GitHub issue
- Check de troubleshooting sectie
- Test eerst met de ingebouwde Test functionaliteit

---

**Gemaakt met ❤️ voor vogelliefhebbers**
