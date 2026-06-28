import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Nurse Shift',
  webDir: 'www',
  android: {
    buildOptions: {
      keystorePath: '',
      keystorePassword: '',
      keystoreAlias: '',
      keystoreAliasPassword: '',
      releaseType: 'APK',
      signingType: 'apksigner'
    }
  },
  server: {
    androidScheme: 'https'
  },
 
  plugins: {
    Camera: {
      
      allowEditing: true
    },
    Geolocation: {
      
      enableHighAccuracy: true
    }
  }
};

export default config;