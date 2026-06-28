import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ToastController, Platform } from '@ionic/angular';
import { Geolocation, Position } from '@capacitor/geolocation';

declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: false,
})
export class MapaPage implements OnInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;

  map: any;
  marker: any;
  currentPosition: Position | null = null;
  latitude: number = -33.4489; // Santiago por defecto
  longitude: number = -70.6693;
  errorMessage: string = '';
  loading: boolean = false;
  watchId: string | null = null;
  isWeb: boolean = false;

  constructor(
    private toastController: ToastController,
    private platform: Platform
  ) {
    this.isWeb = !this.platform.is('android') && !this.platform.is('ios');
    console.log('🌐 ¿Es Web?', this.isWeb);
  }

  ngOnInit() {
    this.obtenerUbicacion();
  }

  ngOnDestroy() {
    this.detenerGeolocalizacion();
  }

  async obtenerUbicacion() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const permissions = await Geolocation.requestPermissions();

      if (permissions.location !== 'granted') {
        this.errorMessage = 'Permiso de ubicación denegado.';
        this.mostrarToast('Permiso de ubicación denegado');
        this.loading = false;
        // Cargar mapa con ubicación por defecto
        setTimeout(() => this.cargarMapa(), 500);
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      });

      this.currentPosition = position;
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      console.log('Ubicación obtenida:', this.latitude, this.longitude);
      this.mostrarToast('Ubicación obtenida correctamente');

      this.iniciarGeolocalizacion();

      setTimeout(() => {
        this.cargarMapa();
      }, 500);

    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);
      
     
      if (error.message?.includes('Not implemented on web') || this.isWeb) {
        console.log('🔄 Usando ubicación por defecto para web');
        this.mostrarToast('🌐 Usando ubicación de prueba (Santiago)');
        this.latitude = -33.4489;
        this.longitude = -70.6693;
        setTimeout(() => this.cargarMapa(), 500);
        this.loading = false;
        return;
      }

      this.errorMessage = 'No se pudo obtener la ubicación. Verifica los permisos.';
      this.mostrarToast('Error al obtener ubicación');
      this.loading = false;
            
      setTimeout(() => this.cargarMapa(), 500);
    }
  }

  iniciarGeolocalizacion() {
    if (this.isWeb) return;

    const callback = (position: Position | null) => {
      if (position) {
        this.currentPosition = position;
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        if (this.map) {
          this.actualizarMarcador(this.latitude, this.longitude);
        }

        console.log('Ubicación actualizada en tiempo real:', this.latitude, this.longitude);
        this.loading = false;
      }
    };

    Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      },
      callback
    ).then((watchId: string) => {
      this.watchId = watchId;
      console.log('Seguimiento iniciado con ID:', watchId);
    }).catch((error) => {
      console.error('Error al iniciar seguimiento:', error);
    });
  }

  detenerGeolocalizacion() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
      console.log('Seguimiento de ubicación detenido');
    }
  }

  cargarMapa() {
    setTimeout(() => {
      if (!this.mapElementRef || !this.mapElementRef.nativeElement) {
        console.error('Elemento del mapa no encontrado');
        return;
      }

      try {
        if (typeof google === 'undefined') {
          this.errorMessage = 'Google Maps no está disponible. Verifica la API Key.';
          this.mostrarToast('Google Maps no disponible');
          this.loading = false;
          return;
        }

        const mapOptions = {
          center: {
            lat: this.latitude || -33.4489,
            lng: this.longitude || -70.6693
          },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        };

        this.map = new google.maps.Map(
          this.mapElementRef.nativeElement,
          mapOptions
        );

        console.log('Mapa cargado correctamente');

        this.agregarMarcador(this.latitude, this.longitude);
        this.loading = false;

      } catch (error: any) {
        console.error('Error al cargar el mapa:', error);
        this.errorMessage = 'Error al cargar el mapa. Verifica tu API Key de Google Maps.';
        this.mostrarToast('Error al cargar el mapa');
        this.loading = false;
      }
    }, 1000);
  }

  agregarMarcador(lat: number, lng: number) {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setMap(null);
    }

    const position = new google.maps.LatLng(lat, lng);

    this.marker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: this.isWeb ? '📍 Ubicación de Prueba' : '📍 Mi ubicación',
      animation: google.maps.Animation.DROP,
      draggable: false
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="text-align: center; padding: 8px;">
          <strong>${this.isWeb ? '📍 Ubicación de Prueba' : '📍 Mi Ubicación'}</strong><br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}
        </div>
      `
    });

    this.marker.addListener('click', () => {
      infoWindow.open(this.map, this.marker);
    });

    this.map.setCenter(position);
    console.log('Marcador agregado en:', lat, lng);
  }

  actualizarMarcador(lat: number, lng: number) {
    if (this.marker) {
      const position = new google.maps.LatLng(lat, lng);
      this.marker.setPosition(position);
      this.map.setCenter(position);
      console.log('Marcador actualizado en:', lat, lng);
    }
  }

  async actualizarUbicacion() {
    await this.obtenerUbicacion();
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: mensaje.includes('❌') ? 'danger' : mensaje.includes('✅') ? 'success' : 'warning'
    });
    toast.present();
  }

  getTimestamp(): string {
    if (!this.currentPosition && !this.isWeb) return '--:--:--';
    return new Date().toLocaleTimeString('es-CL');
  }
}